const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async create({ username, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING user_id, username, email, created_at
        `;
        const values = [username, email, hashedPassword];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async findById(userId) {
        const query = 'SELECT user_id, username, email, created_at, is_admin FROM users WHERE user_id = $1';
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }

    static async updateLastLogin(userId) {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1';
        await db.query(query, [userId]);
    }

    static async validatePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    static async getTotalCount() {
        const query = 'SELECT COUNT(*) as count FROM users';
        const result = await db.query(query);
        return parseInt(result.rows[0].count);
    }

    // Add to models/user.js
static async getRecent({ limit }) {
    const query = `
        SELECT user_id, username, email, created_at, is_admin, is_active
        FROM users
        ORDER BY created_at DESC
        LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
}

static async getAll({ page, limit, search, filter }) {
    const offset = (page - 1) * limit;
    let query = `
        SELECT user_id, username, email, created_at, last_login, is_admin, is_active
        FROM users
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        params.push(`%${search}%`);
        query += ` AND (username ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    if (filter === 'active') {
        query += ' AND is_active = true';
    } else if (filter === 'inactive') {
        query += ' AND is_active = false';
    } else if (filter === 'admin') {
        query += ' AND is_admin = true';
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
}

static async update(userId, { username, email, password }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (username) {
        updates.push(`username = $${paramCount}`);
        values.push(username);
        paramCount++;
    }

    if (email) {
        updates.push(`email = $${paramCount}`);
        values.push(email);
        paramCount++;
    }

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push(`password_hash = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
    }

    if (updates.length === 0) return null;

    values.push(userId);
    const query = `
        UPDATE users
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $${paramCount}
        RETURNING user_id, username, email, created_at, is_admin
    `;

    const result = await db.query(query, values);
    return result.rows[0];
}
}

module.exports = User; 