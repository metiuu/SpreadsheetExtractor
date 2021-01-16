const express = require('express');
const loginRouter = express.Router();
const passport = require('passport');

loginRouter.get('/login', (request, response) => {
    response.render('login.ejs', {title: 'Login Page'});
})

loginRouter.post('/login', (request, response, next) => {
    passport.authenticate('local', {
        successRedirect: '/students',
        failureRedirect: '/login',
        failureFlash: true
    })(request, response, next);
})

loginRouter.get('/logout', (request, response) => {
    request.logout();
    request.flash('success_message', 'You are now logged out');
    response.redirect('/login');
})

module.exports = loginRouter;