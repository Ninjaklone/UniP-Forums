const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { isGuest } = require('../middleware/auth');

// Login page
router.get('/login', isGuest, (req, res) => {
    res.render('login', { 
        title: 'Login',
        extraScripts: true // Enable client-side validation
    });
});

// Login process
router.post('/login', isGuest, async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.render('login', {
                title: 'Login',
                error: 'Please fill in all fields',
                email,
                extraScripts: true
            });
        }

        // Email format validation
        if (!email.includes('@')) {
            return res.render('login', {
                title: 'Login',
                error: 'Please enter a valid email address',
                email,
                extraScripts: true
            });
        }

        const user = await User.findByEmail(email);

        if (!user || !(await User.validatePassword(password, user.password_hash))) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid email or password',
                email,
                extraScripts: true
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.render('login', {
                title: 'Login',
                error: 'Your account has been deactivated. Please contact support.',
                email,
                extraScripts: true
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

        // Redirect to the originally requested URL or home
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(returnTo);
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            title: 'Login',
            error: 'An error occurred during login. Please try again.',
            email: req.body.email,
            extraScripts: true
        });
    }
});

// Register page
router.get('/register', isGuest, (req, res) => {
    res.render('register', { title: 'Register' });
});

// Register process
router.post('/register', isGuest, async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validate password match
        if (password !== confirmPassword) {
            return res.render('register', {
                title: 'Register',
                error: 'Passwords do not match',
                username,
                email
            });
        }

        // Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.render('register', {
                title: 'Register',
                error: 'Email already registered',
                username
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
            error: 'An error occurred during registration',
            username: req.body.username,
            email: req.body.email
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