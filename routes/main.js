const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');
const User = require('../models/user');
const Post = require('../models/post');

// Home page
router.get('/', async (req, res, next) => {
    try {
        // Get recent threads
        const recentThreads = await Thread.getByRecent({ limit: 5 });

        // Get forum statistics
        const stats = {
            userCount: await User.getTotalCount(),
            threadCount: await Thread.getTotalCount(),
            postCount: await Post.getTotalCount()
        };

        res.render('index', {
            title: 'Home',
            layout: 'layouts/main',
            recentThreads,
            stats
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;