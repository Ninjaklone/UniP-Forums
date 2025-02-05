const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Profile validation rules
const profileValidation = [
    check('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    check('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    check('newPassword')
        .optional({ checkFalsy: true })
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Profile routes
router.get('/', isAuthenticated, profileController.getProfile);
router.get('/edit', isAuthenticated, profileController.getEditProfile);
router.post('/edit', isAuthenticated, profileValidation, profileController.updateProfile);

module.exports = router; 