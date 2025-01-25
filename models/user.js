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
}

module.exports = User; 