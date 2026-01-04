const { spawn } = require('child_process');
const { logger } = require('../config');
const tsduckService = require('./tsduck.service');
const analysisModel = require('../models/analysis.model');
const probeModel = require('../models/probe.model');
const { parseTsduckOutput } = require('../utils/parser');

// Storage of active processes
const activeProcesses = new Map();

class ProcessService {
  async startProbe(probe) {
    // Handle both streamId and stream_id (from database)
    const streamId = probe.streamId || probe.stream_id;
    if (!streamId) {
      throw new Error('Stream ID is missing in probe data');
    }
    
    const stream = await require('../models/stream.model').findById(streamId);
    if (!stream) {
      throw new Error(`Stream not found with ID: ${streamId}`);
    }

    const command = tsduckService.buildCommand(probe, stream);
    logger.info(`Starting probe ${probe.id} with the command: ${command.join(' ')}`);

    const childProcess = spawn(command[0], command.slice(1), {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    // Log process start
    logger.info(`Probe ${probe.id} process started with PID: ${childProcess.pid}`);
    
    // Save start log to database immediately
    try {
      const logId = await probeModel.addLog(probe.id, 'info', `Probe started with PID: ${childProcess.pid}`, {
        pid: childProcess.pid,
        command: command.join(' '),
      });
      logger.debug(`Start log saved with ID: ${logId}`);
    } catch (error) {
      logger.error('Error saving start log to database:', error);
      logger.error('Error details:', error.message, error.stack);
    }

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', async (data) => {
      const output = data.toString();
      stdout += output;
      
      logger.debug(`Probe ${probe.id} stdout chunk (${output.length} bytes): ${output.substring(0, 200)}...`);
      
      // Parse and save the analyses in real time
      try {
        const parsed = parseTsduckOutput(output, '', probe.outputFormat || 'text');
        logger.debug(`Probe ${probe.id} parsed output:`, JSON.stringify(parsed).substring(0, 500));
        
        // Always save if we have parsed data, even if it's just raw output
        if (parsed) {
          // Get streamId - handle both camelCase and snake_case from database
          const streamId = probe.streamId || probe.stream_id;
          if (!streamId) {
            logger.warn(`Probe ${probe.id} has no streamId, cannot save analysis`);
            return;
          }
          
          // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
          const now = new Date();
          const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
          
          const analysis = await analysisModel.create({
            probeId: probe.id,
            streamId: streamId,
            data: parsed,
            timestamp: mysqlDateTime,
          });
          logger.info(`Probe ${probe.id} analysis saved with ID: ${analysis.id}`);
        } else {
          logger.debug(`Probe ${probe.id} parsed output is null, skipping save`);
        }
      } catch (error) {
        logger.error(`Error parsing/saving TSDuck output for probe ${probe.id}:`, error);
        logger.error('Error stack:', error.stack);
      }
    });

    childProcess.stderr.on('data', async (data) => {
      const errorOutput = data.toString();
      stderr += errorOutput;
      logger.warn(`TSDuck stderr for probe ${probe.id}: ${errorOutput}`);
      
      // Save error logs to database
      try {
        await probeModel.addLog(probe.id, 'error', errorOutput.trim());
      } catch (error) {
        logger.error('Error saving stderr log to database:', error);
      }
    });

    childProcess.on('close', async (code) => {
      logger.info(`TSDuck process for probe ${probe.id} terminated with code ${code}`);
      logger.info(`Probe ${probe.id} total stdout length: ${stdout.length} bytes`);
      logger.info(`Probe ${probe.id} total stderr length: ${stderr.length} bytes`);
      
      // Try to parse and save final output if we have stdout but no analysis was saved yet
      if (stdout && stdout.trim().length > 0) {
        try {
          logger.debug(`Probe ${probe.id} parsing final stdout output`);
          const parsed = parseTsduckOutput(stdout, stderr, probe.outputFormat || 'text');
          logger.debug(`Probe ${probe.id} final parsed output:`, JSON.stringify(parsed).substring(0, 1000));
          
          if (parsed && Object.keys(parsed).length > 0) {
            // Check if we already saved this analysis (to avoid duplicates)
            // For now, we'll save it anyway as it might be a summary
            // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
            const now = new Date();
            const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
            
            const analysis = await analysisModel.create({
              probeId: probe.id,
              streamId: probe.streamId || probe.stream_id,
              data: parsed,
              timestamp: mysqlDateTime,
            });
            logger.info(`Probe ${probe.id} final analysis saved with ID: ${analysis.id}`);
          } else {
            logger.warn(`Probe ${probe.id} final parsed output is empty or invalid`);
            // Save raw output for debugging
            await probeModel.addLog(probe.id, 'warn', `No valid analysis data extracted. Raw stdout length: ${stdout.length}`);
          }
        } catch (error) {
          logger.error(`Error parsing final TSDuck output for probe ${probe.id}:`, error);
          logger.error('Error stack:', error.stack);
          // Save raw output for debugging
          await probeModel.addLog(probe.id, 'error', `Failed to parse final output: ${error.message}`);
        }
      } else {
        logger.warn(`Probe ${probe.id} process closed but no stdout data received`);
        await probeModel.addLog(probe.id, 'warn', 'Process terminated but no output data received');
      }
      
      // Log the exit code and any stderr output
      if (code !== 0) {
        const errorMessage = `Process terminated with exit code ${code}`;
        logger.error(`Probe ${probe.id}: ${errorMessage}`);
        if (stderr) {
          logger.error(`Probe ${probe.id} stderr output: ${stderr}`);
        }
        
        // Save error logs to database
        try {
          await probeModel.addLog(probe.id, 'error', errorMessage);
          if (stderr) {
            await probeModel.addLog(probe.id, 'error', `stderr: ${stderr.trim()}`);
          }
        } catch (error) {
          logger.error('Error saving close log to database:', error);
        }
        
        // Update status to error if non-zero exit code
        const now = new Date();
        const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
        await probeModel.update(probe.id, {
          status: 'error',
          error: errorMessage,
          stopped_at: mysqlDateTime,
        });
      } else {
        // Normal termination
        const now = new Date();
        const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
        await probeModel.update(probe.id, {
          status: 'stopped',
          stopped_at: mysqlDateTime,
        });
      }

      activeProcesses.delete(probe.id);
    });

    childProcess.on('error', async (error) => {
      const errorMessage = `Error starting TSDuck process: ${error.message}`;
      const errorDetails = {
        message: error.message,
        code: error.code,
        command: command.join(' '),
      };
      
      logger.error(`Error starting TSDuck process for probe ${probe.id}:`, error);
      logger.error(`Command was: ${command.join(' ')}`);
      logger.error(`Error details: ${error.message}, code: ${error.code}`);
      
      // Save error logs to database
      try {
        await probeModel.addLog(probe.id, 'error', errorMessage, errorDetails);
      } catch (logError) {
        logger.error('Error saving error log to database:', logError);
      }
      
      await probeModel.update(probe.id, {
        status: 'error',
        error: error.message,
      });
      activeProcesses.delete(probe.id);
    });

    activeProcesses.set(probe.id, {
      process: childProcess,
      probeId: probe.id,
      startedAt: new Date(),
      stdout,
      stderr,
    });

    return childProcess.pid;
  }

  async stopProbe(processId) {
    // Find the process by PID or by probeId
    let processToStop = null;
    let probeId = null;

    for (const [id, proc] of activeProcesses.entries()) {
      if (proc.process.pid === processId || id === processId) {
        processToStop = proc.process;
        probeId = id;
        break;
      }
    }

    if (!processToStop) {
      throw new Error('Process not found');
    }

    logger.info(`Stopping the process ${processToStop.pid} for probe ${probeId}`);
    
    // Graceful stop first (SIGTERM)
    processToStop.kill('SIGTERM');
    
    // Wait a bit before forcing (SIGKILL)
    setTimeout(() => {
      if (!processToStop.killed) {
        logger.warn(`Force stopping the process ${processToStop.pid} (SIGKILL)`);
        processToStop.kill('SIGKILL');
      }
    }, 5000);

    activeProcesses.delete(probeId);
  }

  async isProcessRunning(processId) {
    // Check in the active processes
    for (const [id, proc] of activeProcesses.entries()) {
      if (proc.process.pid === processId || id === processId) {
        return !proc.process.killed;
      }
    }

    // Check if the process still exists in the system
    try {
      process.kill(processId, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  getAllActiveProcesses() {
    return Array.from(activeProcesses.values()).map(proc => ({
      probeId: proc.probeId,
      pid: proc.process.pid,
      startedAt: proc.startedAt,
    }));
  }
}

module.exports = new ProcessService();


