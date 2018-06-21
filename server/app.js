var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/admin-console');

//// Initialize Passport jwt
require('./passport-init');

var accounts = require('./routes/accounts');
var authenticate = require('./routes/authenticate');

var app = express();

/* This code to disable CORS to allow Angular getting proper responses
  Delete before going to production, since it is meant only for dev purposes */
  var cors = require('cors');
  app.use(cors());
// END of CORS CONFIG

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// List of Middlewares 
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/accounts', passport.authenticate('jwt', {session: false}), accounts);
app.use('/auth', authenticate);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
