module.exports = {
	cookieSecret: 'suchsecretmuchunkown',


	mongo: {
		development: {
			connectionString: 'mongodb://BitesServer:Launch123@ds029803.mongolab.com:29803/heroku_98rtcrbj'
		},
		production: {
			connectionString: 'mongodb://BitesServer:Launch123@ds029803.mongolab.com:29803/heroku_98rtcrbj'
		}
	},

	providers: {
		facebook: {
			development: {
				appId: '1596595767272078',
				appSecret: '57a67c051886e350c539c4cc3913ea3c',
				callBackURL: 'http://localhost:3000/auth/facebook/callback',
				successURL: '/success',
				failURL: '/fail'
			},
			production: {
				appId: '1596595767272078',
				appSecret: '57a67c051886e350c539c4cc3913ea3c',
				callBackURL: 'http://mighty-shore-9561.herokuapp.com/auth/facebook/callback',
				successURL: '/success',
				failURL: '/fail'
			}

		}
	}

};