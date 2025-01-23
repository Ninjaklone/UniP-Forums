const db = require('../config/database');

class Thread {
    static async create({ forumId, userId, title, content, tags = [] }) {
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Create thread
            const threadQuery = `
                INSERT INTO threads (forum_id, user_id, title)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const threadResult = await client.query(threadQuery, [forumId, userId, title]);
            const thread = threadResult.rows[0];

            // Create initial post
            const postQuery = `
                INSERT INTO posts (thread_id, user_id, content)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            await client.query(postQuery, [thread.thread_id, userId, content]);

            // Handle tags
            if (tags.length > 0) {
                for (const tagName of tags) {
                    // Insert tag if it doesn't exist
                    const tagQuery = `
                        INSERT INTO tags (name)
                        VALUES ($1)
                        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                        RETURNING tag_id
                    `;
                    const tagResult = await client.query(tagQuery, [tagName]);
                    const tagId = tagResult.rows[0].tag_id;

                    // Create thread-tag association
                    const threadTagQuery = `
                        INSERT INTO thread_tags (thread_id, tag_id)
                        VALUES ($1, $2)
                    `;
                    await client.query(threadTagQuery, [thread.thread_id, tagId]);
                }
            }

            await client.query('COMMIT');
            return thread;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getByForum(forumId, { page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT t.*,
                   u.username as author_name,
                   COUNT(DISTINCT p.post_id) as reply_count,
                   MAX(p.created_at) as last_reply_at,
                   array_agg(DISTINCT tag.name) as tags
            FROM threads t
            JOIN users u ON t.user_id = u.user_id
            LEFT JOIN posts p ON t.thread_id = p.thread_id
            LEFT JOIN thread_tags tt ON t.thread_id = tt.thread_id
            LEFT JOIN tags tag ON tt.tag_id = tag.tag_id
            WHERE t.forum_id = $1
            GROUP BY t.thread_id, u.username
            ORDER BY t.is_sticky DESC, t.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [forumId, limit, offset]);
        return result.rows;
    }

    static async getById(threadId) {
        const query = `
            SELECT t.*,
                   u.username as author_name,
                   COUNT(DISTINCT p.post_id) as reply_count,
                   array_agg(DISTINCT tag.name) as tags
            FROM threads t
            JOIN users u ON t.user_id = u.user_id
            LEFT JOIN posts p ON t.thread_id = p.thread_id
            LEFT JOIN thread_tags tt ON t.thread_id = tt.thread_id
            LEFT JOIN tags tag ON tt.tag_id = tag.tag_id
            WHERE t.thread_id = $1
            GROUP BY t.thread_id, u.username
        `;
        const result = await db.query(query, [threadId]);
        return result.rows[0];
    }

    static async update(threadId, { title, is_sticky, is_closed }) {
        const query = `
            UPDATE threads
            SET title = COALESCE($1, title),
                is_sticky = COALESCE($2, is_sticky),
                is_closed = COALESCE($3, is_closed)
            WHERE thread_id = $4
            RETURNING *
        `;
        const result = await db.query(query, [title, is_sticky, is_closed, threadId]);
        return result.rows[0];
    }
}

module.exports = Thread; 