const db = require('../storage');

class AlertModel {
  async findAll(options = {}) {
    const { limit = 100, offset = 0, acknowledged } = options;
    let sql = 'SELECT * FROM alerts';
    const params = [];

    if (acknowledged !== undefined) {
      sql += ' WHERE acknowledged = ?';
      params.push(acknowledged ? 1 : 0);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM alerts WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findUnacknowledged() {
    const [rows] = await db.execute(
      'SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY timestamp DESC'
    );
    return rows;
  }

  async create(data) {
    const {
      type,
      probeId,
      severity = 'medium',
      message,
      data: alertData = {},
      timestamp = new Date(),
      acknowledged = false,
    } = data;

    const sql = `
      INSERT INTO alerts (type, probe_id, severity, message, data, timestamp, acknowledged)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(
      sql,
      [type, probeId, severity, message, JSON.stringify(alertData), timestamp, acknowledged ? 1 : 0]
    );

    return await this.findById(result.insertId);
  }

  async update(id, data) {
    const updates = [];
    const values = [];

    Object.keys(data).forEach(key => {
      // Skip undefined values
      if (data[key] === undefined) {
        return;
      }
      
      if (key === 'data' && typeof data[key] === 'object') {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(data[key]));
      } else if (key === 'acknowledged') {
        updates.push(`${key} = ?`);
        values.push(data[key] ? 1 : 0);
      } else {
        updates.push(`${key} = ?`);
        // Convert undefined to null for SQL
        values.push(data[key] === undefined ? null : data[key]);
      }
    });

    if (updates.length === 0) {
      return null;
    }

    values.push(id);
    const sql = `UPDATE alerts SET ${updates.join(', ')} WHERE id = ?`;

    const [result] = await db.execute(sql, values);
    
    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM alerts WHERE id = ?', [id]);
    return { deleted: result.affectedRows > 0 };
  }
}

module.exports = new AlertModel();
