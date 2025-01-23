require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// User routes
app.get('/user/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT user_id, username, email, created_at FROM users WHERE user_id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/user', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
      [username, email, password] // Note: In a real app, you'd hash the password before storing
    );
    res.status(201).json({ user_id: rows[0].user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forum routes
app.get('/forum/:id?', async (req, res) => {
  try {
    let query = 'SELECT * FROM forums';
    let params = [];
    if (req.params.id) {
      query += ' WHERE forum_id = $1';
      params.push(req.params.id);
    }
    const { rows } = await pool.query(query, params);
    if (req.params.id && rows.length === 0) {
      return res.status(404).json({ message: 'Forum not found' });
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Thread routes
app.get('/thread/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM threads WHERE thread_id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/thread', async (req, res) => {
  const { forum_id, user_id, title } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO threads (forum_id, user_id, title) VALUES ($1, $2, $3) RETURNING thread_id',
      [forum_id, user_id, title]
    );
    res.status(201).json({ thread_id: rows[0].thread_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post routes
app.get('/post/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM posts WHERE post_id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/post', async (req, res) => {
  const { thread_id, user_id, content } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO posts (thread_id, user_id, content) VALUES ($1, $2, $3) RETURNING post_id',
      [thread_id, user_id, content]
    );
    res.status(201).json({ post_id: rows[0].post_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// For testing purposes

// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// });

// app.get('/', (req, res) => {
//     res.send("Hello from Node API Testing!");
// });
