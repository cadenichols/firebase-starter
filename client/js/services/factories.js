'use strict';

var app = angular.module('fireApp');

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

app.factory('$tweets', function($firebaseArray, FB_URL) {
  var ref = new Firebase(FB_URL);
  var tweetsRef = ref.child('tweets');
  return $firebaseArray(tweetsRef);
});

app.factory('$authObj', function($firebaseAuth, FB_URL) {
  var ref = new Firebase(FB_URL);
  return $firebaseAuth(ref);
});

