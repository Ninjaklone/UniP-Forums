const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth');
const pool = require('../config/database');

// Configure multer for memory storage instead of disk
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Image upload endpoint for TinyMCE
router.post('/images', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Insert the image into the database
        const result = await pool.query(
            'INSERT INTO images (filename, data, mime_type, user_id) VALUES ($1, $2, $3, $4) RETURNING image_id',
            [req.file.originalname, req.file.buffer, req.file.mimetype, req.session.user.id]
        );

        // Return the URL that will serve the image
        const imageUrl = `/uploads/images/${result.rows[0].image_id}`;
        res.json({
            location: imageUrl
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Serve images from the database
router.get('/images/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT data, mime_type FROM images WHERE image_id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Image not found');
        }

        const image = result.rows[0];
        res.set('Content-Type', image.mime_type);
        res.send(image.data);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send('Error serving image');
    }
});

module.exports = router; 