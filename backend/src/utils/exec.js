const { spawn, exec } = require('child_process');
const { logger } = require('../config');

/**
 * Execute a command asynchronously
 */
function execCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      ...options,
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
      resolve({
        code,
        stdout,
        stderr,
      });
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Execute a simple command with exec
 */
function execSimple(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

module.exports = {
  execCommand,
  execSimple,
};


