const express = require('express');
const router = express.Router();

const User = require('../models/User');
const passport = require('passport');

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get('/users/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
    const {name, email, password, password2} = req.body;
    const errors = [];
    if (name.length == 0) {
        errors.push({text: 'Ingrese su Usuario'});
    }
    if (password != password2) {
        errors.push({text: 'Las password no coinciden'});
    }
    if (password.length < 4) {
        errors.push({text: 'La password debe tener más de 4 carácteres'});
    }
    if (errors.length > 0) {
        res.render('users/signup', {errors, name, email, password, password2});
    } else {
        const emailUser = await User.findOne({email: email});
        if (emailUser) {
            req.flash('error_msg', 'El email ya esta en uso con otro usuario');
            res.redirect('/users/signup');
        }
        const newUser = new User({name, email, password});
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'Ya estas registrado!');
        res.redirect('/users/signin');
    }
});

router.get('/users/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;