var User = require('./user.model.js'),
	passport = require('passport'),
	credentials = require('../credentials.js');
	FacebookStrategy = require('passport-facebook').Strategy;

var express = require('express');
var router = express.Router();


passport.serializeUser(function(user, done) {
	done(null,user._id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user) {
		if (err || !user) return done(err,null);
		done(null,user);
	})
});

module.exports = function(app, options) {


	return {
		init: function() {


			 try {
			var env = app.get('env');
			var config = options.providers;


			if (!options.successRedirect) {
				options.successRedirect = config.facebook[env].successURL;
			}
			if (!options.failureRedirect) {
				options.failureRedirect = config.facebook[env].failURL;
			}

			app.get(config.facebook[env].successURL, function(req, res) {
		  		res.send('Auth successful!');
			})

			app.use(require('cookie-parser')(credentials.cookieSecret));
			app.use(require('express-session')({secret:credentials.cookieSecret, store:options.sessionStor }));
			app.use(passport.initialize());
			app.use(passport.session());

			passport.use(new FacebookStrategy({
				clientID: config.facebook[env].appId,
				clientSecret: config.facebook[env].appSecret,
				callbackURL: config.facebook[env].callBackURL,
				profileFields: ['id', 'emails'],
			},
			function (accessToken, refreshToken, profile, done) {
				var authId = 'facebook' + profile.id;

				User.findOne({authId: authId}, function(err, user) {
					if (err) return done(err,null);
					if (user) return done(null, user);

					user = new User({
						authId: authId,
						name: profile.displayName,
						email: profile.emails[0].value,
						created: Date.now(),
						facebook: profile._json
					});
					user.facebook.accessToken = accessToken;
					user.save(function(err) {
						if (err) return done(err,null);
						done(null,user);
					})

				});


				options.successRedirect = config.facebook[env].successURL + "?oauth_token=" + accessToken;
				console.log(accessToken);

			}));
		}
		catch (err) {console.log(err)};

		},
		registerRoutes: function() {
			var env = app.get('env');
			var config = options.providers;

			console.log('try to register routes');


			app.get('/auth/facebook',
				passport.authenticate('facebook', {
					callbackURL: config.facebook[env].callBackURL, scope: [ 'email' ]
				}),
				function (req,res) {

				});

		


				app.get('/auth/facebook/callback',
						passport.authenticate('facebook', { failureRedirect: options.failureRedirect , scope: [ 'email' ] }),
						function(req, res) {
							res.redirect(303, options.successRedirect);
					});




		}
	}
};
