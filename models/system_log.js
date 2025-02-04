// models/system_log.js
const db = require('../config/database');

class SystemLog {
    static async get({ page = 1, limit = 50, type = 'all', startDate, endDate }) {
        const offset = (page - 1) * limit;
        const params = [];
        let query = `
            SELECT l.*, u.username
            FROM system_logs l
            LEFT JOIN users u ON l.user_id = u.user_id
            WHERE 1=1
        `;

        if (type !== 'all') {
            params.push(type);
            query += ` AND l.type = $${params.length}`;
        }

        if (startDate) {
            params.push(startDate);
            query += ` AND l.created_at >= $${params.length}`;
        }

        if (endDate) {
            params.push(endDate);
            query += ` AND l.created_at <= $${params.length}`;
        }

        query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
    }

    static async getTotalCount({ type = 'all', startDate, endDate }) {
        const params = [];
        let query = 'SELECT COUNT(*) as count FROM system_logs WHERE 1=1';

        if (type !== 'all') {
            params.push(type);
            query += ` AND type = $${params.length}`;
        }

        if (startDate) {
            params.push(startDate);
            query += ` AND created_at >= $${params.length}`;
        }

        if (endDate) {
            params.push(endDate);
            query += ` AND created_at <= $${params.length}`;
        }

        const result = await db.query(query, params);
        return parseInt(result.rows[0].count);
    }

    static async create({ type, message, userId = null, metadata = null }) {
        const query = `
            INSERT INTO system_logs (type, message, user_id, metadata)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await db.query(query, [type, message, userId, metadata]);
        return result.rows[0];
    }
}

module.exports = SystemLog;