require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

// Database configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    store: new pgSession({
        pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === 'production'
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes (to be implemented)
app.get('/', async (req, res, next) => {
    try {
        // Get recent threads
        const recentThreads = await pool.query(`
            SELECT t.thread_id, t.title, t.created_at, u.username
            FROM threads t
            JOIN users u ON t.user_id = u.user_id
            ORDER BY t.created_at DESC
            LIMIT 5
        `);

        // Get forum statistics
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as user_count,
                (SELECT COUNT(*) FROM threads) as thread_count,
                (SELECT COUNT(*) FROM posts) as post_count
        `);

        res.render('layouts/main', {
            title: 'University Forums',
            recentThreads: recentThreads.rows,
            stats: stats.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).render('error', {
        error: {
            status: statusCode,
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 