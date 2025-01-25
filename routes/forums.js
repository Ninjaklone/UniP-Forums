const express = require('express');
const router = express.Router();
const Forum = require('../models/forum');
const Thread = require('../models/thread');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.session.user?.is_admin) {
        return res.status(403).render('error', {
            error: {
                status: 403,
                message: 'Access denied. Admin privileges required.'
            }
        });
    }
    next();
};

// List all forums
router.get('/', async (req, res) => {
    try {
        const forums = await Forum.getAll();
        res.render('forums', {
            title: 'Forums',
            forums
        });
    } catch (error) {
        next(error);
    }
});

// Create new forum (admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        await Forum.create({ name, description });
        res.redirect('/forums');
    } catch (error) {
        next(error);
    }
});

// View single forum and its threads
router.get('/:id', async (req, res, next) => {
    try {
        const forumId = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const limit = 20;

        const forum = await Forum.getById(forumId);
        if (!forum) {
            return res.status(404).render('error', {
                error: {
                    status: 404,
                    message: 'Forum not found'
                }
            });
        }

        const threads = await Thread.getByForum(forumId, { page, limit });
        const totalThreads = forum.thread_count;
        const totalPages = Math.ceil(totalThreads / limit);

        res.render('forum', {
            title: forum.name,
            forum,
            threads,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        next(error);
    }
});

// Update forum (admin only)
router.post('/:id', isAdmin, async (req, res, next) => {
    try {
        const forumId = parseInt(req.params.id);
        const { name, description } = req.body;
        
        await Forum.update(forumId, { name, description });
        res.redirect(`/forums/${forumId}`);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 