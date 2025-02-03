const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');
const Post = require('../models/post');
const { isAuthenticated } = require('../middleware/auth');
const Forum = require('../models/forum');

// Recent threads
router.get('/recent', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const threads = await Thread.getByRecent({ page, limit });
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
                title: 'Bad Request',
                error: {
                    status: 400,
                    message: 'Forum ID is required'
                }
            });
        }

        const forum = await Forum.getById(parseInt(forumId));
        if (!forum) {
            return res.status(404).render('error', {
                title: 'Not Found',
                error: {
                    status: 404,
                    message: 'Forum not found'
                }
            });
        }

        res.render('thread-form', {
            title: 'Start New Discussion',
            forum
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
                title: 'Not Found',
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

// Delete thread
router.delete('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const threadId = parseInt(req.params.id);
        const userId = req.session.user.id;

        // Get the thread to check ownership
        const thread = await Thread.getById(threadId);
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        // Check if user owns the thread or is admin
        if (thread.user_id !== userId && !req.session.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized to delete this thread' });
        }

        // Delete the thread
        await Thread.delete(threadId);
        res.json({ message: 'Thread deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Toggle sticky status
router.post('/:id/sticky', isAuthenticated, async (req, res, next) => {
    try {
        const threadId = parseInt(req.params.id);
        
        // Only admins can toggle sticky status
        if (!req.session.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized to modify thread status' });
        }

        const thread = await Thread.getById(threadId);
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        await Thread.update(threadId, { is_sticky: !thread.is_sticky });
        res.json({ message: 'Thread sticky status updated successfully' });
    } catch (error) {
        next(error);
    }
});

// Toggle closed status
router.post('/:id/close', isAuthenticated, async (req, res, next) => {
    try {
        const threadId = parseInt(req.params.id);
        
        // Only admins can toggle closed status
        if (!req.session.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized to modify thread status' });
        }

        const thread = await Thread.getById(threadId);
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        await Thread.update(threadId, { is_closed: !thread.is_closed });
        res.json({ message: 'Thread closed status updated successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 