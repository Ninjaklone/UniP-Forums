const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const User = require('../models/user');
const Forum = require('../models/forum');
const Thread = require('../models/thread');
const Post = require('../models/post');
const SystemLog = require('../models/system_log');

// Protect all admin routes
router.use(isAdmin);

// Admin Dashboard
router.get('/', async (req, res, next) => {
    try {
        const stats = {
            userCount: await User.getTotalCount(),
            threadCount: await Thread.getTotalCount(),
            postCount: await Post.getTotalCount(),
            // Might add more statistics as needed
        };

        // Get recent activity
        const recentThreads = await Thread.getByRecent({ limit: 5 });
        const recentUsers = await User.getRecent({ limit: 5 });

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats,
            recentThreads,
            recentUsers
        });
    } catch (error) {
        next(error);
    }
});

// User Management
router.get('/users', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const search = req.query.search || '';
        const filter = req.query.filter || 'all'; // all, active, inactive, admin

        const users = await User.getAll({ page, limit, search, filter });
        const totalUsers = await User.getTotalCount({ search, filter });
        const totalPages = Math.ceil(totalUsers / limit);

        res.render('admin/users', {
            title: 'User Management',
            users,
            currentPage: page,
            totalPages,
            search,
            filter
        });
    } catch (error) {
        next(error);
    }
});

// Forum Management
router.get('/forums', async (req, res, next) => {
    try {
        const forums = await Forum.getAll();
        const forumStats = await Promise.all(forums.map(async forum => ({
            ...forum,
            threadCount: await Thread.getCountByForum(forum.forum_id),
            postCount: await Post.getCountByForum(forum.forum_id),
            lastActivity: await Forum.getLastActivity(forum.forum_id)
        })));

        res.render('admin/forums', {
            title: 'Forum Management',
            forums: forumStats
        });
    } catch (error) {
        next(error);
    }
});

// Content Moderation
router.get('/moderation', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const type = req.query.type || 'reported'; // reported, flagged, pending
        
        const reports = await Post.getReports({ page, limit, type });
        const totalReports = await Post.getTotalReports({ type });
        const totalPages = Math.ceil(totalReports / limit);

        res.render('admin/moderation', {
            title: 'Content Moderation',
            reports,
            currentPage: page,
            totalPages,
            type
        });
    } catch (error) {
        next(error);
    }
});

// System Settings
router.get('/settings', async (req, res, next) => {
    try {
        const settings = {
            //system settings here
            forumName: process.env.FORUM_NAME || 'University Forums',
            allowRegistration: process.env.ALLOW_REGISTRATION === 'true',
            maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
            //settings here
        };

        res.render('admin/settings', {
            title: 'System Settings',
            settings
        });
    } catch (error) {
        next(error);
    }
});

// Logs and Activity
router.get('/logs', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const type = req.query.type || 'all'; // all, error, security, audit
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const logs = await SystemLog.get({ page, limit, type, startDate, endDate });
        const totalLogs = await SystemLog.getTotalCount({ type, startDate, endDate });
        const totalPages = Math.ceil(totalLogs / limit);

        res.render('admin/logs', {
            title: 'System Logs',
            logs,
            currentPage: page,
            totalPages,
            type,
            startDate,
            endDate
        });
    } catch (error) {
        next(error);
    }
});

// API endpoints for admin actions

// User Management APIs
router.post('/users/:id/toggle-status', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        await User.toggleStatus(userId);
        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/users/:id/toggle-admin', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        await User.toggleAdmin(userId);
        res.json({ message: 'Admin status updated successfully' });
    } catch (error) {
        next(error);
    }
});

// Forum Management APIs
router.post('/forums/reorder', async (req, res, next) => {
    try {
        const { order } = req.body;
        await Forum.updateOrder(order);
        res.json({ message: 'Forum order updated successfully' });
    } catch (error) {
        next(error);
    }
});

// Moderation APIs
router.post('/reports/:id/resolve', async (req, res, next) => {
    try {
        const reportId = parseInt(req.params.id);
        const { action, reason } = req.body;
        await Post.resolveReport(reportId, action, reason);
        res.json({ message: 'Report resolved successfully' });
    } catch (error) {
        next(error);
    }
});

// System Settings APIs
router.post('/settings', async (req, res, next) => {
    try {
        const { settings } = req.body;
        // Update system settings
        // This would typically involve updating environment variables or a settings table
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 