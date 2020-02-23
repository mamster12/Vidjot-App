module.exports = {
    ensureAuthenticated: function (req, res, next) {
        //check if user is logged in
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please Login to your account');
        res.redirect('/users/login');
    }
}