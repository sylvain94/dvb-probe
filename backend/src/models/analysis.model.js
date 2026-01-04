const db = require('../storage');

class AnalysisModel {
  async findAll(options = {}) {
    const { limit = 50, offset = 0 } = options;
    const [rows] = await db.execute(
      'SELECT * FROM analyses ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM analyses WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findByProbeId(probeId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    const [rows] = await db.execute(
      'SELECT * FROM analyses WHERE probe_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [probeId, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  }

  async findByStreamId(streamId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    const [rows] = await db.execute(
      'SELECT * FROM analyses WHERE stream_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [streamId, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  }

  async create(data) {
    const {
      probeId,
      streamId,
      data: analysisData,
      timestamp,
    } = data;

    // Convert timestamp to MySQL format if needed
    let mysqlTimestamp;
    if (timestamp instanceof Date) {
      mysqlTimestamp = timestamp.toISOString().slice(0, 19).replace('T', ' ');
    } else if (typeof timestamp === 'string') {
      // If it's already in MySQL format, use it as is
      // If it's ISO format, convert it
      if (timestamp.includes('T')) {
        mysqlTimestamp = timestamp.slice(0, 19).replace('T', ' ');
      } else {
        mysqlTimestamp = timestamp;
      }
    } else {
      // Default to current time in MySQL format
      const now = new Date();
      mysqlTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
    }

    const sql = `
      INSERT INTO analyses (probe_id, stream_id, data, timestamp)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(
      sql,
      [probeId, streamId, JSON.stringify(analysisData), mysqlTimestamp]
    );

    return await this.findById(result.insertId);
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM analyses WHERE id = ?', [id]);
    return { deleted: result.affectedRows > 0 };
  }
}

module.exports = new AnalysisModel();
