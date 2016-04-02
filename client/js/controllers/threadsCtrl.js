'use strict';

var app = angular.module('fireApp');


app.controller('threadsCtrl', function($scope, $threads) {

  console.log('threadsCtrl!!!');
  $scope.threads = $threads.getArray(); // Three-way data-binding!!!

  $scope.threads.$loaded().then(function(threads) {
    console.log('first thread:', threads[0]);
  });

  $scope.addThread = function() {
    $threads.create($scope.newThread.subject)
    // .then(function(ref) {
    //   console.log('ref:', ref);
    // })
    // .catch(function(err) {
    //   console.log('err:', err);
    // })
    $scope.newThread = {};
  };

});
