const db = require('../config/database');

class Forum {
    static async create({ name, description }) {
        const query = `
            INSERT INTO forums (name, description)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result = await db.query(query, [name, description]);
        return result.rows[0];
    }

    static async getAll() {
        const query = `
            SELECT f.*, 
                   COUNT(DISTINCT t.thread_id) as thread_count,
                   COUNT(DISTINCT p.post_id) as post_count
            FROM forums f
            LEFT JOIN threads t ON f.forum_id = t.forum_id
            LEFT JOIN posts p ON t.thread_id = p.thread_id
            GROUP BY f.forum_id
            ORDER BY f.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    static async getById(forumId) {
        const query = `
            SELECT f.*, 
                   COUNT(DISTINCT t.thread_id) as thread_count,
                   COUNT(DISTINCT p.post_id) as post_count
            FROM forums f
            LEFT JOIN threads t ON f.forum_id = t.forum_id
            LEFT JOIN posts p ON t.thread_id = p.thread_id
            WHERE f.forum_id = $1
            GROUP BY f.forum_id
        `;
        const result = await db.query(query, [forumId]);
        return result.rows[0];
    }

    static async update(forumId, { name, description }) {
        const query = `
            UPDATE forums
            SET name = $1, description = $2
            WHERE forum_id = $3
            RETURNING *
        `;
        const result = await db.query(query, [name, description, forumId]);
        return result.rows[0];
    }

    static async delete(forumId) {
        const client = await db.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get all thread IDs in this forum
            const threadResult = await client.query('SELECT thread_id FROM threads WHERE forum_id = $1', [forumId]);
            const threadIds = threadResult.rows.map(row => row.thread_id);
            
            if (threadIds.length > 0) {
                // Delete all posts in these threads
                await client.query('DELETE FROM posts WHERE thread_id = ANY($1)', [threadIds]);
                
                // Delete thread-tag associations
                await client.query('DELETE FROM thread_tags WHERE thread_id = ANY($1)', [threadIds]);
                
                // Delete the threads
                await client.query('DELETE FROM threads WHERE forum_id = $1', [forumId]);
            }
            
            // Finally, delete the forum
            await client.query('DELETE FROM forums WHERE forum_id = $1', [forumId]);
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = Forum; 