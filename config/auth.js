module.exports = {
    ensureAuthenticated: function(request, response, next) {
        if(request.isAuthenticated()) {
            return next();
        }
        request.flash('error_message', 'Please log in to view resource');
        response.redirect('/login');
    }
}