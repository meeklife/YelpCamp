const express = require('express');
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
// const localStrategy = require('passport-local')
// const {storeReturnTo} = require('../middleware')
const users = require('../controllers/users')


router.route('/register')
    // Register routes
    .get( users.renderRegister)
    .post(catchAsync (users.register));

router.route('/login')
    // Login Routes
    .get(users.renderLogin)
    .post( passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

//logout Routes
router.get('/logout', users.logout)


module.exports = router;