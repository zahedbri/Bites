angular.module('starter.services', [])

.factory("currentMeal",function(){
        return {};
})

.factory("currentProfile",function(){
        return {};
})

.factory("mealProfile",function(){
        return {};
})


.factory("hStars", function() {
  return {};

})

.factory("uhStars", function() {
  return {};
})

.factory("halfStar", function() {
  return {};
})

.factory("currentChefMeals", function() {
  return {};
})

.factory("pastChefMeals", function() {
  return {};
})

.factory('Meals', function($http) {
  return {


getMeals:function() {
      return $http.get('http://bitesapp.com/meals/getAll').then(function(resp) {
          return resp;
        });
    }


    /*
   getMeals: function() {
      return $http.get('https://bitesapp.herokuapp.com/meals/getAll').then(function(resp) {
          return resp;
        });
    }
*/

/*
getMeals:function() {
      return $http.get('http://localhost:3000/meals/getAll').then(function(resp) {
          return resp;
        });
    }
*/

  };
})


.factory('Camera', ['$q', function($q) {
  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}])

.factory('APIServer', function() {
  return {
    url: function() {
      return "http://bitesapp.com";
      //return "https://bitesapp.herokuapp.com";
      //return "http://localhost:3000";
    }
  };
})

.factory('localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])


.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
