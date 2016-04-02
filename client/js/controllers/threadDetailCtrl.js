'use strict';

var app = angular.module('fireApp');

app.controller('threadDetailCtrl', function($scope, $state, thread, posts) {
  $scope.thread = thread;
  $scope.posts = posts;


  console.log('$scope.authData:', $scope.authData);
  console.log('$scope.profile:', $scope.profile);

  $scope.addPost = function() {
    if($scope.authData) {
      var newPost = {
        text: $scope.newPost.text,
        name: $scope.profile.name,
        color: $scope.profile.color
      };
      $scope.posts.$add(newPost);
      $scope.newPost = {};
    }
  };

});
