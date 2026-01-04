/**
 * Parse the TSDuck output according to the format (text or json)
 */
function parseTsduckOutput(stdout, stderr, format = 'text') {
  if (format === 'json') {
    try {
      // TSDuck can produce multiple JSON objects separated by newlines
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      const results = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      }).filter(r => r !== null);

      return results.length === 1 ? results[0] : results;
    } catch (error) {
      return { error: 'Error parsing JSON', raw: stdout };
    }
  }

  // Parsing the text format
  const result = {
    raw: stdout,
    errors: stderr,
    sections: [],
    services: [],
    pids: {},
    bitrate: null,
    packetCount: null,
    summary: {},
  };

  if (!stdout || stdout.trim().length === 0) {
    return result;
  }

  // Basic extraction of information from the text
  const lines = stdout.split('\n');
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Detection of sections (PAT, PMT, SDT, etc.)
    if (trimmedLine.match(/\b(PAT|PMT|SDT|NIT|EIT|CAT|TOT|TDT)\b/i)) {
      result.sections.push(trimmedLine);
    }
    
    // Detection of services
    if (trimmedLine.match(/\bService\b/i) || trimmedLine.match(/Service\s+\d+/i)) {
      result.services.push(trimmedLine);
    }
    
    // Detection of bitrate
    const bitrateMatch = trimmedLine.match(/bitrate[:\s]+([\d.]+)\s*([KMGT]?bps|bps)/i);
    if (bitrateMatch) {
      let bitrate = parseFloat(bitrateMatch[1]);
      const unit = bitrateMatch[2]?.toUpperCase() || '';
      if (unit.includes('K')) bitrate *= 1000;
      else if (unit.includes('M')) bitrate *= 1000000;
      else if (unit.includes('G')) bitrate *= 1000000000;
      result.bitrate = bitrate;
    }
    
    // Detection of packet count
    const packetMatch = trimmedLine.match(/(?:packets?|TS\s+packets?)[:\s]+(\d+)/i);
    if (packetMatch) {
      result.packetCount = parseInt(packetMatch[1], 10);
    }
    
    // Detection of PID information
    const pidMatch = trimmedLine.match(/PID\s+(\d+)[:\s]+(.+)/i);
    if (pidMatch) {
      const pid = parseInt(pidMatch[1], 10);
      result.pids[pid] = pidMatch[2].trim();
    }
  });

  // If we have any meaningful data, return it
  // Otherwise, return at least the raw output so we can see what TSDuck produced
  if (result.sections.length > 0 || result.services.length > 0 || result.bitrate || result.packetCount) {
    return result;
  }
  
  // If no structured data found, still return the result with raw data
  // This ensures we save something even if parsing is incomplete
  return result;
}

/**
 * Parse the metrics from an analysis
 */
function parseMetrics(analysisData) {
  if (!analysisData) return {};

  const metrics = {
    bitrate: null,
    packetCount: null,
    errorCount: null,
    services: [],
  };

  // Extraction of metrics from the analysis data
  // TODO: Adapt to the actual TSDuck format
  if (analysisData.bitrate) {
    metrics.bitrate = analysisData.bitrate;
  }

  if (analysisData.services && Array.isArray(analysisData.services)) {
    metrics.services = analysisData.services;
  }

  return metrics;
}

module.exports = {
  parseTsduckOutput,
  parseMetrics,
};


