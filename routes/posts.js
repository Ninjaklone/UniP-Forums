const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { isAuthenticated } = require('../middleware/auth');

// Update post
router.put('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id);
        const { content } = req.body;
        const userId = req.session.user.id;

        // Get the post to check ownership
        const post = await Post.getById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user owns the post or is admin
        if (post.user_id !== userId && !req.session.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }

        // Update the post
        await Post.update(postId, { content });
        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        next(error);
    }
});

// Delete post
router.delete('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.session.user.id;

        // Get the post to check ownership
        const post = await Post.getById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user owns the post or is admin
        if (post.user_id !== userId && !req.session.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        // Delete the post
        await Post.delete(postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 