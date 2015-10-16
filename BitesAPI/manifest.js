/**
 * Server Manifest
 */

var express = require('express');
var glob = require('glob');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var Config = require('./config');
var mongoose = require('mongoose');
var credentials = require('./credentials.js');


module.exports = function(app) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';





// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

  // Request Middleware
  // app.use(favicon(Config.get('/root') + '/public/img/favicon.ico'));
  //app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());


//mongoose code

var opts = {
  server: {
    socketOptions: {keepAlive: 1}
  }
};

switch(app.get('env')) {
  case 'development':
    mongoose.connect(credentials.mongo.development.connectionString, opts);
    break;
  case 'production':
    mongoose.connect(credentials.mongo.production.connectionString, opts);
    break;
  default:
    throw new Error("unknown exec env");
};


mongoose.connection.on('error', function () {
  throw new Error('unable to connect to database at ' + Config.get('/mongo/uri'));
});



var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo.development.connectionString });
var User = require('./users/user.model.js');

var opts = {
  providers: credentials.providers,
  successRedirect: '/',
  failureRedirect: '/unauthorized',
  sessionStor: sessionStore
};

var auth = require('./users/auth.js')(app, opts);
auth.init();
try {
auth.registerRoutes();
}
catch (err) {console.log(err)};

app.use(function(req, res, next){
  res.locals.loggedIn = true;
  if(!req.session.passport.user)
    res.locals.loggedIn = false;
  else
    res.locals.loggedIn = true;

  next();
});













  //Server models
  var models = glob.sync(Config.get('/root') + '/**/*.model.js');
  models.forEach(function (model) {
    require(model);
  });

  // Server Controllers
  var controllers = glob.sync(Config.get('/root') + '/**/*.controller.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  //require(Config.get('/root') + '/app/app.controller')(app);


};