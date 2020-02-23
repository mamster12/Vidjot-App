const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

module.exports = router;

//Load idea model
require('../models/Idea');
const Idea = mongoose.model('ideas');


//add details route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

//edit idea route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            if (idea.user != req.user.id) {
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/ideas');
            } else {
                res.render('ideas/edit', {
                    idea: idea
                });
            }
        });
});

//ideas post route
router.post('/', ensureAuthenticated, (req, res) => {

    const errors = [];

    if (!req.body.title) {
        errors.push({ text: 'Please add a Title' });
    }

    if (!req.body.details) {
        errors.push({ text: 'Please add some details' });
    }

    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }

        new Idea(newUser)
            .save()
            .then(idea => {
                req.flash('success_msg', 'Idea added successfuly');
                res.redirect('/ideas');
            });
    }
});

router.get('/', ensureAuthenticated, (req, res) => {
    Idea.find({ user: req.user.id })
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });
});

//route for edited idea using put request
router.put('/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save()
                .then(idea => {
                    if (idea.user != req.user.id) {
                        req.flash('error_msg', 'Not Authorized');
                        res.redirect('/ideas');
                    } else {
                        req.flash('success_msg', 'Idea edited successfuly');
                        res.redirect('/ideas');
                    }
                });
        });
});

//delete route - delete idea from db
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Idea.remove({
        _id: req.params.id
    })
        .then(() => {
            req.flash('error_msg', 'Idea has been deleted');
            res.redirect('/ideas');
        });
});