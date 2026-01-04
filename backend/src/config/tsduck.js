const path = require('path');
const fs = require('fs');

const TSDUCK_PATH = process.env.TSDUCK_PATH || '/usr/bin/tsp';
const PROFILES_PATH = process.env.TSDUCK_PROFILES_PATH || path.join(__dirname, '../../config/profiles');
const DEFAULT_OPTIONS = process.env.TSDUCK_DEFAULT_OPTIONS || '';

// Create the profiles directory if it doesn't exist
if (!fs.existsSync(PROFILES_PATH)) {
  fs.mkdirSync(PROFILES_PATH, { recursive: true });
}

module.exports = {
  path: TSDUCK_PATH,
  profilesPath: PROFILES_PATH,
  defaultOptions: DEFAULT_OPTIONS ? DEFAULT_OPTIONS.split(' ').filter(opt => opt) : [],
  
  // Check if TSDuck is available
  checkAvailability: () => {
    return fs.existsSync(TSDUCK_PATH);
  },
  
  // Predefined profiles
  profiles: {
    basic: {
      name: 'Basic analysis',
      // Basic: analyze for 2 seconds then stop
      plugins: [
        { type: 'processor', name: 'until', options: ['-s', '2'] },
        { type: 'processor', name: 'analyze', options: [] },
      ],
    },
    detailed: {
      name: 'Detailed analysis',
      // Detailed: analyze for 2 seconds with JSON output
      plugins: [
        { type: 'processor', name: 'until', options: ['-s', '2'] },
        { type: 'processor', name: 'analyze', options: [] },
      ],
      outputFormat: 'json',
    },
    monitoring: {
      name: 'Continuous monitoring',
      // Continuous: analyze indefinitely
      plugins: [
        { type: 'processor', name: 'analyze', options: [] },
      ],
      outputFormat: 'json',
    },
  },
};


