const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = router;

//Load user model
require('../models/User');
const User = mongoose.model('users');

//Register route
router.get('/register', (req, res) => {
    res.render('users/register');
});

//Register post route
router.post('/register', (req, res) => {
    let errors = [];

    if (req.body.password2 != req.body.password) {
        errors.push({ text: 'Password do not match' });
    }

    if (req.body.password.length < 4) {
        errors.push({ text: 'password must be at least 4 characters' })
    }

    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        });
    }
    else {
        User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    req.flash('error_msg', 'email already registered');
                    res.render('users/register', {
                        errors: errors,
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password,
                        password2: req.body.password2
                    });
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    });

                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(newUser.password, salt, function (err, hash) {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'Your account has been registerd!')
                                    res.redirect('/users/login');
                                })
                                .catch(err => {
                                    console.log(err);
                                    return;
                                });
                        });
                    });
                }
            });
    }
});

//Login route
router.get('/login', (req, res) => {
    res.render('users/login');
});

//login Authentication - Local Strategy
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true,
        successFlash: 'Welcome'
    })(req, res, next);
});  

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have been logged out');
    res.redirect('/users/login');
});