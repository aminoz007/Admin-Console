var express = require('express');
var router = express.Router();
var account = require('../controllers/account-controller');

// API for all accounts
router.route('/')

      //Create a new account
      .post(account.create)

      // Get all accounts
      .get(account.getAll)

// API to get stats
router.route('/stats')

      // get accounts stats 
      .get(account.stats)

// API for a specific account
router.route('/:accountId')

      // update an existing account
      .put(account.update)

      // get account by id
      .get(account.get)

      // delete account by id
      .delete(account.delete)

module.exports = router;
