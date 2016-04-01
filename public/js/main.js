'use strict';

var app = angular.module('fireApp', ['firebase', 'ui.router']);



app.controller('mainCtrl', function($scope, $tweets, $authObj, ProfileFactory) {
  $scope.tweets = $tweets;
  $scope.authObj = $authObj;

  $scope.authObj.$onAuth(function(authData) {
    console.log('authData:', authData);
    $scope.authData = authData;
    $scope.profile = ProfileFactory(authData.uid);
  });

  $scope.logout = function() {
    $scope.authObj.$unauth();
  };

  $scope.register = function(user) {
    $scope.authObj.$createUser(user)
    .then(function(userData) {
      console.log('user created:', userData);
      return $scope.authObj.$authWithPassword(user);
    })
    .then(function(authData) {
      console.log('user logged in:', authData);
    })
    .catch(function(err) {
      console.log('err:', err);
    });
  };

  $scope.login = function(user) {
    $scope.authObj.$authWithPassword(user)
    .then(function(authData) {
      console.log('user logged in:', authData);
    })
    .catch(function(err) {
      console.log('err:', err);
    });
  };

});

app.factory('ProfileFactory', function($firebaseObject, FB_URL) {
  return function(uid) {
    if(!uid) {
      return {};
    };
    var profilesRef = new Firebase(FB_URL + 'profiles');
    var userRef = profilesRef.child(uid);
    return $firebaseObject(userRef);
  };
});


app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

app.constant('FB_URL', 'https://cades-cool-app.firebaseio.com/');

app.factory('$tweets', function($firebaseArray, FB_URL) {
  var ref = new Firebase(FB_URL);
  var tweetsRef = ref.child('tweets');
  return $firebaseArray(tweetsRef);
});

app.factory('$authObj', function($firebaseAuth, FB_URL) {
  var ref = new Firebase(FB_URL);
  return $firebaseAuth(ref);
});

