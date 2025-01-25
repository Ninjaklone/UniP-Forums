// Authentication middleware
exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        // Store the requested URL to redirect after login
        req.session.returnTo = req.originalUrl;
        return res.redirect('/auth/login');
    }
    next();
};

// Admin middleware
exports.isAdmin = (req, res, next) => {
    if (!req.session.user?.is_admin) {
        return res.status(403).render('error', {
            title: 'Access Denied',
            error: {
                status: 403,
                message: 'You need administrator privileges to access this page.'
            }
        });
    }
    next();
};

// Guest middleware (for login/register pages)
exports.isGuest = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
}; 