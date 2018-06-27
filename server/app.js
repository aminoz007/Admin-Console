var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');

var mongoose = require('mongoose');

if(process.env.DEV_ENV){
	mongoose.connect('mongodb://localhost/admin-console');
}
else{
	mongoose.connect(process.env.PROD_MONGODB);
}

//// Initialize Passport jwt
require('./passport-init');

var accounts = require('./routes/accounts');
var authenticate = require('./routes/authenticate');

var app = express();

/* This code to disable CORS to allow Angular getting proper responses
  to be used only in dev, since it is meant only for dev purposes */
if(process.env.DEV_ENV){
  var cors = require('cors');
  app.use(cors());
}

// List of Middlewares 
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/accounts', passport.authenticate('jwt', {session: false}), accounts);
app.use('/auth', authenticate);

if(!process.env.DEV_ENV){
	// In production serve only the static files from views directory
	app.use(express.static(path.join(__dirname, 'views')));
	app.get('*', function(req,res) {    
	  res.sendFile(path.join(__dirname, 'views/index.html'));
	});
}


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
