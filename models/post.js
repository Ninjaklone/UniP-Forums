const db = require('../config/database');

class Post {
    static async create({ threadId, userId, content }) {
        const query = `
            INSERT INTO posts (thread_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await db.query(query, [threadId, userId, content]);
        return result.rows[0];
    }

    static async getByThread(threadId, { page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT p.*,
                   u.username as author_name,
                   u.is_admin as is_admin
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.thread_id = $1
            ORDER BY p.created_at ASC
            LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [threadId, limit, offset]);
        return result.rows;
    }

    static async update(postId, userId, { content }) {
        const query = `
            UPDATE posts
            SET content = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE post_id = $2 AND user_id = $3
            RETURNING *
        `;
        const result = await db.query(query, [content, postId, userId]);
        return result.rows[0];
    }

    static async delete(postId, userId) {
        const query = `
            DELETE FROM posts
            WHERE post_id = $1 AND user_id = $2
            RETURNING *
        `;
        const result = await db.query(query, [postId, userId]);
        return result.rows[0];
    }

    static async getPostCount(threadId) {
        const query = `
            SELECT COUNT(*) as count
            FROM posts
            WHERE thread_id = $1
        `;
        const result = await db.query(query, [threadId]);
        return parseInt(result.rows[0].count);
    }

    static async getTotalCount() {
        const query = 'SELECT COUNT(*) as count FROM posts';
        const result = await db.query(query);
        return parseInt(result.rows[0].count);
    }
}

module.exports = Post; 