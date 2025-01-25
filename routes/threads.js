const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');
const Post = require('../models/post');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Recent threads
router.get('/recent', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const threads = await Thread.getRecent({ page, limit });
        const totalThreads = await Thread.getTotalCount();
        const totalPages = Math.ceil(totalThreads / limit);

        res.render('recent', {
            title: 'Recent Discussions',
            threads,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        next(error);
    }
});

// New thread form
router.get('/new', isAuthenticated, async (req, res, next) => {
    try {
        const forumId = req.query.forum;
        if (!forumId) {
            return res.status(400).render('error', {
                error: {
                    status: 400,
                    message: 'Forum ID is required'
                }
            });
        }

        res.render('thread-form', {
            title: 'Start New Discussion',
            forumId
        });
    } catch (error) {
        next(error);
    }
});

// Create new thread
router.post('/new', isAuthenticated, async (req, res, next) => {
    try {
        const { forumId, title, content, tags } = req.body;
        const userId = req.session.user.id;

        const thread = await Thread.create({
            forumId: parseInt(forumId),
            userId,
            title,
            content,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        res.redirect(`/threads/${thread.thread_id}`);
    } catch (error) {
        next(error);
    }
});

// View thread
router.get('/:id', async (req, res, next) => {
    try {
        const threadId = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const limit = 20;

        const thread = await Thread.getById(threadId);
        if (!thread) {
            return res.status(404).render('error', {
                error: {
                    status: 404,
                    message: 'Thread not found'
                }
            });
        }

        const posts = await Post.getByThread(threadId, { page, limit });
        const totalPosts = await Post.getPostCount(threadId);
        const totalPages = Math.ceil(totalPosts / limit);

        res.render('thread', {
            title: thread.title,
            thread,
            posts,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        next(error);
    }
});

// Reply to thread
router.post('/:id/reply', isAuthenticated, async (req, res, next) => {
    try {
        const threadId = parseInt(req.params.id);
        const { content } = req.body;
        const userId = req.session.user.id;

        await Post.create({
            threadId,
            userId,
            content
        });

        res.redirect(`/threads/${threadId}`);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 