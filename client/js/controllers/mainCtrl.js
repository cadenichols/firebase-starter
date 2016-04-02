'use strict';

var app = angular.module('fireApp');

app.controller('mainCtrl', function($scope, $tweets, $authObj, ProfileFactory) {
  $scope.tweets = $tweets;
  $scope.authObj = $authObj;

  $scope.authObj.$onAuth(function(authData) {
    $scope.authData = authData;
    if(authData) {
      $scope.profile = ProfileFactory(authData.uid);
    } else {
      $scope.profile = null;
    }
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
