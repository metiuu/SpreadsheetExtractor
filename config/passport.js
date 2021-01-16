const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User model
const User = require('../models/users');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
          // Match user
          User.findOne({
            username: username
          }).then(result => {
            if (!result) {
              return done(null, false, { message: 'That username is not registered' });
            }
    
            // Match password
            bcrypt.compare(password, result.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, result);
              } else {
                return done(null, false, { message: 'Password incorrect' });
              }
            });
          })
          .catch(err => console.log(err));
        })
      );
    
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
    
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });

    
};