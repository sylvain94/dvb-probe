const db = require('../storage');

class ProbeModel {
  async findAll() {
    const [rows] = await db.execute('SELECT * FROM probes ORDER BY created_at DESC');
    return rows;
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM probes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data) {
    const {
      name,
      description,
      streamId,
      profile = 'basic',
      options = [],
      outputFormat = 'text',
    } = data;

    const sql = `
      INSERT INTO probes (name, description, stream_id, profile, options, output_format, status)
      VALUES (?, ?, ?, ?, ?, ?, 'stopped')
    `;

    const [result] = await db.execute(
      sql,
      [name, description, streamId, profile, JSON.stringify(options), outputFormat]
    );

    return await this.findById(result.insertId);
  }

  async update(id, data) {
    const updates = [];
    const values = [];

    // Mapping from camelCase (frontend) to snake_case (database)
    const fieldMapping = {
      streamId: 'stream_id',
      outputFormat: 'output_format',
    };

    // Filter out undefined values and convert field names
    const cleanData = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        // Convert camelCase to snake_case if needed
        const dbKey = fieldMapping[key] || key;
        cleanData[dbKey] = data[key];
      }
    });

    Object.keys(cleanData).forEach(key => {
      const value = cleanData[key];
      
      if (key === 'options' && Array.isArray(value)) {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        updates.push(`${key} = ?`);
        // Ensure we never pass undefined
        values.push(value === null ? null : value);
      }
    });

    if (updates.length === 0) {
      return null;
    }

    values.push(id);
    const sql = `UPDATE probes SET ${updates.join(', ')} WHERE id = ?`;

    // Debug: Check for undefined values
    values.forEach((val, idx) => {
      if (val === undefined) {
        console.error(`Undefined value at index ${idx} in update for probe ${id}:`, { updates, values, data });
      }
    });

    const [result] = await db.execute(sql, values);
    
    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM probes WHERE id = ?', [id]);
    return { deleted: result.affectedRows > 0 };
  }

  async getLogs(id, options = {}) {
    const { limit = 100, offset = 0 } = options;
    try {
      const [rows] = await db.execute(
        'SELECT * FROM probe_logs WHERE probe_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
        [id, parseInt(limit, 10), parseInt(offset, 10)]
      );
      const { logger } = require('../config');
      logger.debug(`Retrieved ${rows.length} logs from database for probe ${id}`);
      return rows;
    } catch (error) {
      const { logger } = require('../config');
      logger.error(`Error retrieving logs for probe ${id}:`, error);
      throw error;
    }
  }

  async addLog(probeId, level, message, data = null) {
    try {
      const sql = `
        INSERT INTO probe_logs (probe_id, level, message, data)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.execute(sql, [
        probeId,
        level,
        message,
        data ? JSON.stringify(data) : null,
      ]);
      const { logger } = require('../config');
      logger.debug(`Log saved for probe ${probeId}: level=${level}, id=${result.insertId}`);
      return result.insertId;
    } catch (error) {
      const { logger } = require('../config');
      logger.error(`Error saving log for probe ${probeId}:`, error);
      throw error;
    }
  }
}

module.exports = new ProbeModel();
