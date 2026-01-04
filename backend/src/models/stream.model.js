const db = require('../storage');

class StreamModel {
  async findAll() {
    const [rows] = await db.execute('SELECT * FROM streams ORDER BY created_at DESC');
    return rows;
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM streams WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data) {
    const {
      name,
      description,
      type,
      address,
      port,
      options = {},
    } = data;

    const sql = `
      INSERT INTO streams (name, description, type, address, port, options)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(
      sql,
      [name, description, type, address, port, JSON.stringify(options)]
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
      
      if (key === 'options' && typeof data[key] === 'object') {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(data[key]));
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
    const sql = `UPDATE streams SET ${updates.join(', ')} WHERE id = ?`;

    const [result] = await db.execute(sql, values);
    
    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM streams WHERE id = ?', [id]);
    return { deleted: result.affectedRows > 0 };
  }
}

module.exports = new StreamModel();
