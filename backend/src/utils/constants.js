module.exports = {
  PROBE_STATUS: {
    STOPPED: 'stopped',
    RUNNING: 'running',
    ERROR: 'error',
    PAUSED: 'paused',
  },

  STREAM_TYPE: {
    UDP: 'udp',
    RTP: 'rtp',
  },

  ALERT_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },

  ALERT_TYPE: {
    PROBE_CRASHED: 'probe_crashed',
    HIGH_ERROR_RATE: 'high_error_rate',
    LOW_BITRATE: 'low_bitrate',
    STREAM_LOST: 'stream_lost',
    SYSTEM_RESOURCE: 'system_resource',
  },

  TSDUCK_PROFILES: {
    BASIC: 'basic',
    DETAILED: 'detailed',
    MONITORING: 'monitoring',
  },

  OUTPUT_FORMAT: {
    TEXT: 'text',
    JSON: 'json',
  },
};


