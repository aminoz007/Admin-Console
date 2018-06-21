const express = require('express');
const router  = express.Router();
const passport = require('passport');
var user = require('../controllers/user-controller');

// POST login
router.route('/login')

      // login with a specific user and get token
      .post(user.login)

// API for all users
router.route('/')

      //Create a new user
      .post(passport.authenticate('jwt', {session: false}), user.create)

      // Get all users
      .get(passport.authenticate('jwt', {session: false}), user.getAll)

// API for a specific user
router.route('/:userName')

      // update an existing user
      .put(passport.authenticate('jwt', {session: false}), user.update)

      // get account by id
      .get(passport.authenticate('jwt', {session: false}), user.get)

      // delete account by id
      .delete(passport.authenticate('jwt', {session: false}), user.delete)

module.exports = router;