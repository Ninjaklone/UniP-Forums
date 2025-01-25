const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Login' });
});

// Login process
router.post('/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await User.findByEmail(email);

        if (!user || !(await User.validatePassword(password, user.password_hash))) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid email or password'
            });
        }

        // Update last login time
        await User.updateLastLogin(user.user_id);

        // Set session
        req.session.user = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
        };

        if (rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }

        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            title: 'Login',
            error: 'An error occurred during login'
        });
    }
});

// Register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register', { title: 'Register' });
});

// Register process
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validate password match
        if (password !== confirmPassword) {
            return res.render('register', {
                title: 'Register',
                error: 'Passwords do not match'
            });
        }

        // Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.render('register', {
                title: 'Register',
                error: 'Email already registered'
            });
        }

        // Create new user
        const user = await User.create({ username, email, password });

        // Set session
        req.session.user = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            is_admin: false
        };

        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', {
            title: 'Register',
            error: 'An error occurred during registration'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router; 