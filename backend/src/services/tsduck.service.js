const { spawn, exec } = require('child_process');
const { logger } = require('../config');
const tsduckConfig = require('../config/tsduck');
const { parseTsduckOutput } = require('../utils/parser');

class TsduckService {
  constructor() {
    this.path = tsduckConfig.path;
    this.profiles = tsduckConfig.profiles;
    this.containerName = process.env.TSDUCK_CONTAINER || 'dvb-probe-tsduck';
    this.useDocker = process.env.USE_DOCKER_TSDUCK !== 'false'; // Use Docker by default
  }

  async checkAvailability() {
    if (this.useDocker) {
      // Check if we can execute docker commands
      return new Promise((resolve) => {
        exec(`docker exec ${this.containerName} tsp --version`, { timeout: 5000 }, (error) => {
          if (error) {
            logger.warn(`TSDuck container check failed: ${error.message}`);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    }
    return tsduckConfig.checkAvailability();
  }

  getPath() {
    return this.path;
  }

  async getVersion() {
    if (this.useDocker) {
      return new Promise((resolve, reject) => {
        exec(`docker exec ${this.containerName} tsp --version 2>&1`, (error, stdout, stderr) => {
          if (error && !stdout) {
            reject(new Error(`TSDuck version check failed: ${stderr || error.message}`));
          } else {
            // Extract version from output (format: "tsp: TSDuck - ... - version X.Y.Z-XXXX")
            const output = stdout || stderr || '';
            const versionMatch = output.match(/version\s+([\d.]+-[\d]+)/i);
            if (versionMatch) {
              resolve(versionMatch[1]);
            } else {
              // Return full output if version pattern not found
              resolve(output.trim().split('\n').pop() || 'Unknown');
            }
          }
        });
      });
    }

    return new Promise((resolve, reject) => {
      const process = spawn(this.path, ['--version']);
      let output = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`TSDuck version check failed with code ${code}`));
        }
      });
    });
  }

  buildCommand(probe, stream) {
    const command = [];
    
    if (this.useDocker) {
      command.push('docker', 'exec', '-i', this.containerName, 'tsp');
    } else {
      command.push(this.path);
    }
    
    // Default options (if any)
    if (tsduckConfig.defaultOptions && tsduckConfig.defaultOptions.length > 0) {
      command.push(...tsduckConfig.defaultOptions);
    }

    // Input: UDP/RTP
    // TSDuck syntax: -I ip [address:]port
    if (stream.type === 'udp') {
      const ipParam = stream.address ? `${stream.address}:${stream.port}` : stream.port.toString();
      command.push('-I', 'ip', ipParam);
    } else if (stream.type === 'rtp') {
      const ipParam = stream.address ? `${stream.address}:${stream.port}` : stream.port.toString();
      command.push('-I', 'ip', '--rtp', ipParam);
    }

    // Processors (plugins) from profile
    const profile = probe.profile && this.profiles[probe.profile] ? this.profiles[probe.profile] : null;
    if (profile && profile.plugins) {
      profile.plugins.forEach(plugin => {
        command.push('-P', plugin.name);
        if (plugin.options && plugin.options.length > 0) {
          command.push(...plugin.options);
        }
      });
    }

    // JSON output if requested (in profile or probe)
    const outputFormat = probe.outputFormat || (profile && profile.outputFormat);
    if (outputFormat === 'json') {
      command.push('--json');
    }

    // Custom options from probe
    if (probe.options && Array.isArray(probe.options)) {
      command.push(...probe.options);
    }

    // Output: drop (discard packets after analysis)
    command.push('-O', 'drop');

    return command;
  }

  async analyze(probe, stream, options = {}) {
    return new Promise((resolve, reject) => {
      const command = this.buildCommand(probe, stream);
      logger.info(`TSDuck execution: ${command.join(' ')}`);

      const process = spawn(command[0], command.slice(1), {
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0 || code === null) {
          const result = parseTsduckOutput(stdout, stderr, probe.outputFormat);
          resolve(result);
        } else {
          reject(new Error(`TSDuck failed with code ${code}: ${stderr}. Output: ${stdout}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to start TSDuck: ${error.message}. Output: ${stdout}`));
      });
    });
  }
}

module.exports = new TsduckService();
