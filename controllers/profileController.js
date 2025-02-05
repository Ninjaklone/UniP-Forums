const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Get profile page
exports.getProfile = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.id) {
            req.flash('error', 'Please login to view your profile');
            return res.redirect('/auth/login');
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/');
        }
        
        res.render('profile/index', {
            title: 'Profile',
            user: user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        req.flash('error', 'Error loading profile');
        res.redirect('/');
    }
};

// Get profile edit page
exports.getEditProfile = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.id) {
            req.flash('error', 'Please login to edit your profile');
            return res.redirect('/auth/login');
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/');
        }

        res.render('profile/edit', {
            title: 'Edit Profile',
            user: user
        });
    } catch (error) {
        console.error('Error loading edit profile page:', error);
        req.flash('error', 'Error loading edit profile page');
        res.redirect('/profile');
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.id) {
            req.flash('error', 'Please login to update your profile');
            return res.redirect('/auth/login');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('profile/edit', {
                title: 'Edit Profile',
                user: req.session.user,
                error: errors.array()[0].msg
            });
        }

        const { username, email, currentPassword, newPassword, confirmNewPassword } = req.body;
        const user = await User.findById(req.session.user.id);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/');
        }

        // Check if username is taken (if changed)
        if (username !== user.username) {
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.render('profile/edit', {
                    title: 'Edit Profile',
                    user: req.session.user,
                    error: 'Username is already taken'
                });
            }
        }

        // Check if email is taken (if changed)
        if (email !== user.email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.render('profile/edit', {
                    title: 'Edit Profile',
                    user: req.session.user,
                    error: 'Email is already registered'
                });
            }
        }

        // Update basic info
        const updatedFields = {
            username,
            email
        };

        // Handle password change if requested
        if (newPassword) {
            // Verify current password
            const isMatch = await User.validatePassword(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.render('profile/edit', {
                    title: 'Edit Profile',
                    user: req.session.user,
                    error: 'Current password is incorrect'
                });
            }

            // Verify new password matches confirmation
            if (newPassword !== confirmNewPassword) {
                return res.render('profile/edit', {
                    title: 'Edit Profile',
                    user: req.session.user,
                    error: 'New passwords do not match'
                });
            }

            updatedFields.password = newPassword;
        }

        const updatedUser = await User.update(user.user_id, updatedFields);

        // Update session data
        req.session.user = {
            id: updatedUser.user_id,
            username: updatedUser.username,
            email: updatedUser.email,
            is_admin: updatedUser.is_admin
        };

        req.flash('success', 'Profile updated successfully');
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.render('profile/edit', {
            title: 'Edit Profile',
            user: req.session.user,
            error: 'Error updating profile'
        });
    }
}; 