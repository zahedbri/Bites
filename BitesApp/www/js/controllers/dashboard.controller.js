angular.module('dashboard.controllers', ['ionic-ratings'])

// Work on the Following, Need to get the Post Requests
// Up and runnin

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {




.controller('DashCtrl',  function($scope, $rootScope, $state, $stateParams, Camera, Meals, hStars, halfStar, uhStars, currentProfile, currentMeal, localStorage, APIServer, $http, $ionicSideMenuDelegate) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.meal = currentMeal.meal;
    $scope.chef = currentProfile.data;
    $scope.hStars = hStars.data;
    $scope.uhStars = uhStars.data;
    $scope.halfStars = halfStar.data;

    console.log($scope.chef);


/*
    var pickupUgly = $scope.meal.deadline
    var pickupPretty = "Sunday"
    console.log("uuu" + pickupUgly);
    
    $scope.meal.pickupPretty = pickupPretty;
*/
    var acc = localStorage.get("userToken");

    $http.get(APIServer.url() + '/users/byToken',{headers:{'accesstoken': acc }}).then(function(resp) {
      localStorage.set("oid",resp.data._id);
      localStorage.set("name",resp.data.name);
      localStorage.set("isChef",resp.data.isChef);

    });

  })

  $scope.doRefresh = function() {

    req = Meals.getMeals();

    req.then(function(result) {  // this is only run after $http completes
       $scope.meals = result.data;


       //console.log(result.data);
       //currentMeal.meals = result.data;
       //console.log(currentMeal.meals);
        $scope.$broadcast('scroll.refreshComplete');
    });

   
  }


  $scope.calculateRatingStars = function(rating) {
    hStars.data = [];
    uhStars.data = [];
    halfStar.data = [];

    var decimal = rating - Math.round(rating);
    console.log("Var Decimal: " + decimal);

    console.log("Stars to put: " + rating);
    for (var i = 0; i < Math.round(rating); i++) {
      hStars.data.push(i);
    }

    if (decimal > .25 && decimal < .75) {
      halfStar.data.push(1);
    }

    if (hStars.data.length < 5) {
      var x = 5 - hStars.data.length;
      console.log("Stars to put: " + x);
    }

    for (var i = 0; i < x; i++) {
      uhStars.data.push(i)
    }

    if (halfStar.data.length == 1) {
      uhStars.data.splice(0, 1);
    }

    console.log(hStars.data.length);
    console.log(halfStar.data.length);
  }

  $scope.doRefresh();

  $scope.goMeal = function() {
    $state.go("preapp.newmeal");    
  }

  // Placeholder goChef function
  $scope.goChef = function(oid) {
    if (oid == 'null') oid = localStorage.get("oid");

    currentProfile.oid = oid;

    $http.get(APIServer.url() + '/users/individual/' + oid).then(function(resp) {
      
      currentProfile.data = resp.data;

      $scope.calculateRatingStars(currentProfile.data.rating);

      $state.go("preapp.chef");

      console.log("Stars: " + hStars);
      for (var i = 0; i < hStars.length; i++) {
        console.log(hStars[i]);
      }
      console.log("No Stars: " + uhStars);
    });


  }

  // Settings goSettings function
  $scope.goSettings = function() {
    $state.go("preapp.settings")
  }

  $scope.toMeal = function(mealCurrent) {
    currentMeal.meal = mealCurrent;
    console.log(currentMeal.meal)
    $state.go("preapp.meal")
  }

  // Get the Photo
  $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageURI) {
      return imageURI
      console.log(imageURI);
    }, function(err) {
      console.err(err);
    });
  };

  $scope.tabs = [{
    title: 'About',
    url: 'about.html',
    style: 'left-active'
  }, {
    title: 'Ingredients',
    url: 'ingredients.html',
    style: 'right'
  }];

  $scope.chefTabs = [{
    title: 'Currently Cooking',
    url: 'current.html',
    style: 'left-active'
  }, {
    title: 'Past Meals',
    url: 'past.html',
    style: 'right'
  }];

  $scope.currentTab = 'about.html';

  $scope.currentChefTab = 'current.html';

  $scope.onClickChefTab = function(tab) {
    $scope.currentChefTab = tab.url;
    if (tab.url == 'current.html') {
      tab.style = 'left-active';
      $scope.chefTabs[1].style = 'right';
    }

    if (tab.url == 'past.html') {
      tab.style = 'right-active';
      $scope.chefTabs[0].style = 'left';
    }
  }

  $scope.onClickTab = function(tab) {
    $scope.currentTab = tab.url;
    if (tab.url == 'about.html') {
      tab.style = 'left-active';
      $scope.tabs[1].style = 'right';
    }

    if (tab.url == 'ingredients.html') {
      tab.style = 'right-active';
      $scope.tabs[0].style = 'left';
    }
  }

  $scope.isActiveTab = function(tabUrl) {
    return tabUrl == $scope.currentTab;
  }

  $scope.goDash = function() {
    $state.go("preapp.dashboard");
  }

  $scope.findMeal = function() {

    for (meal in Object) {
      
      if (p.hasOwnProperty(key)) {
        alert(key + " -> " + p[key]);
      }

      if (meal._id == $stateParams.id) {
        $scope.meal = meal._id;
      }
    }
  }

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }

  $scope.submitRating = function() {
    console.log($scope.rate);
    console.log($scope.meal._id);

    $http({
      method: 'POST',
      url: APIServer.url() + '/meals/rating',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},

      
      // I have no idea if this is necessary
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      

      data: {
        rating: $scope.ratingsObject.rating,
        oid: $scope.meal._id
      }

    }).then(function (response) {
        alert("Rating Submitted");
    })
  }
  // Setting the rating variables
  $scope.ratingsObject = {
    iconOn : 'ion-ios-star',
    iconOff : 'ion-ios-star-outline',
    iconOnColor: 'rgb(200, 200, 100)',
    iconOffColor: 'rgb(200, 100, 100)',
    rating: 3,
    minRating: 1,
    callback: function(rating) {
      $scope.ratingsCallback(rating);
    }
  };

  $scope.ratingsCallback = function(rating) {
    console.log('Selected rating is : ', rating);
    $scope.ratingsObject.rating = rating;
  };
})
