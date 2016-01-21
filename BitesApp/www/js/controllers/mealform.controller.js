angular.module('mealform.controllers', ['ionic-ratings','jrCrop'])


.controller('MealFormCtrl', function($scope,$ionicLoading, $ionicAnalytics, $window, $location, $http, APIServer,localStorage, Camera, $state, $jrCrop, $cordovaFileTransfer) {
  $scope.data = {};
  
  $scope.goDash = function() {
    $state.go("preapp.dashboard");
  }


//  $scope.photo = "http://cdn3.vox-cdn.com/uploads/chorus_asset/file/917470/iphone-6-travel-photo-review-mann-header.0.jpg"


  $scope.fromCamera = function () {
    $scope.takePicture(navigator.camera.PictureSourceType.CAMERA);
  }

  $scope.fromLibrary = function () {

    $scope.takePicture(navigator.camera.PictureSourceType.PHOTOLIBRARY);

  }

  $scope.processImage = function (imgURL) {

    console.log(imgURL);

    var img = new Image();
      img.onload = function() {

        console.log(this);
        console.log("processed image" + this.height/this.width);
        //i have currently disabled crop because of image upload problems!
        if (this.height/this.width > 1) {

        alert("Could not use image. Image height cannot exceed image width. Please take photos in landscape mode (hold phone horizontally).");

/*
          $jrCrop.crop({
              url: imgURL,
              width: 400,
              height: 400
          }).then(function(canvas) {
              // success!

              var image = canvas.toDataURL();

              $scope.photo = image;
              $scope.$apply();


          }, function() {
              alert("Image height cannot exceed image width");
              // User canceled or couldn't load image.
          });*/

        }
        else {
          console.log("set scope to photo");
          $scope.photo = imgURL;
          $scope.$apply();

         console.log($scope.photo);
        }

      }
      img.src = imgURL;
  }


  $scope.takePicture = function (source) {

    var options =   {
      quality: 50,
      destinationType: navigator.camera.DestinationType.FILE_URI,
      sourceType: source,
      encodingType: 0,
      correctOrientation:true
      };

    Camera.getPicture(options).then(function(res) {
      
      $scope.processImage(res);

      return res;
    }, function(err) {
      console.log(err);
    });
  }

  $scope.resetForm = function (){
    $scope.data.mealDate = null;
    $scope.data.pickup = null;
    $scope.data.orderDeadline = null;
     $scope.data.title = null;
      $scope.data.description = null;
      $scope.data.price = null;

       $scope.data.maxOrder = null;
       $scope.data.numOrder = null;
       $scope.data.mealLocation = null;
        $scope.data.ingredients = null;
       $scope.data.name = null;
        $scope.photo = "";

      $scope.$apply();


  }

  $scope.getImage = function(src) {
  if (src !== "") {
    return src;  
  } else {
   return "//:0"; 
  }
};


  $scope.newMeal = function() {

    
    $ionicLoading.show({
      template: 'Posting meal data'
    });
    

    var pickupFixed = new Date($scope.data.mealDate.getFullYear(), $scope.data.mealDate.getMonth(), $scope.data.mealDate.getDate(), 
               $scope.data.pickup.getHours(), $scope.data.pickup.getMinutes(), $scope.data.pickup.getSeconds());
    
    var orderDeadlineFixed = new Date($scope.data.mealDate.getFullYear(), $scope.data.mealDate.getMonth(), $scope.data.mealDate.getDate(), 
               $scope.data.orderDeadline.getHours(), $scope.data.orderDeadline.getMinutes(), $scope.data.orderDeadline.getSeconds());



    $http({
          method: 'POST',
          url: APIServer.url() + '/getChefToken',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},

          transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },

          data:  {
            userToken: localStorage.get("userToken")
          }
            
    }).then (function (response) {

            console.log("response" + response);

            if (response.data.message == "SUCCESS") {
                console.log("response chefToken " + response.data.chefToken);
                chefToken = response.data.chefToken;
                
                $http({
                  method: 'POST',
                  url: APIServer.url() + '/meals',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},

                  
                  // I have no idea if this is necessary
                  transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                  },
                  

                  data: {
                    title: $scope.data.title,
                    description: $scope.data.description,
                    orderDeadline: orderDeadlineFixed,
                    pickup: pickupFixed,
                    price: $scope.data.price,
                    maxOrder: $scope.data.maxOrder,
                    numOrder: $scope.data.numOrder,
                    mealLocation: $scope.data.mealLocation,
                    ingredients: $scope.data.ingredients,
                    name: $scope.data.name,
                    userOID: localStorage.get("oid"),
                    userName: localStorage.get("name") ,
                    chefToken: chefToken,
                    access:localStorage.get("userToken")
                  }
                }).then(function (response) {
                    $ionicLoading.hide();
                    console.log(response);
                    
                    if (response.data.id) {
                    if ($scope.photo != null && $scope.photo != "" && $scope.photo.length > 1) {
                      $ionicLoading.show({
                        template: 'Uploading photo'
                      });

                    $cordovaFileTransfer.upload(APIServer.url() + "/meals/uploadPicture/" + response.data.id, $scope.photo, {}).then(function(result) {
                      alert("Meal successfully posted");
                      $ionicAnalytics.track("Meal w/ Picture Posted", {
                        meal: {
                          title: $scope.data.title,
                          price: $scope.data.price,
                          maxOrder: $scope.data.maxOrder,
                          pickup: pickupFixed,
                          orderDeadline: orderDeadlineFixed
                        },
                        user: {
                          oid: localStorage.get("oid"),
                          name: localStorage.get("name")
                        }
                      });
                      $scope.resetForm();
                      $ionicLoading.hide();
                       $state.go("preapp.dashboard");

                    }, function(err) {
                      $ionicLoading.hide();
                      alert("Server error");
                        console.log("ERROR: " + JSON.stringify(err));
                    }, function (progress) {
                        // constant progress updates
                    });
                    }
                    else {
                      alert("Meal successfully posted");
                      $ionicAnalytics.track("Meal w/o Picture Posted", {
                        meal: {
                          title: $scope.data.title,
                          price: $scope.data.price,
                          maxOrder: $scope.data.maxOrder,
                          pickup: pickupFixed,
                          orderDeadline: orderDeadlineFixed
                        },
                        user: {
                          oid: localStorage.get("oid"),
                          name: localStorage.get("name")
                        }
                      });
                      $ionicLoading.hide();
                      $scope.resetForm();

                       $state.go("preapp.dashboard");

                    }
                  }
                  else {
                    alert("Server error. Could not load meal id.");
                  }

                })

            } else if (response.data.message == "NO CHEF TOKEN") {
              console.log(response.data);
              alert("Sorry, you are not a registered chef and only chefs may post meals");
              $state.go("preapp.dashboard");
            } else {
              console.log(response.data);
              alert("Error: " + response.data.reason.message);
            }
    });







     

  }


})