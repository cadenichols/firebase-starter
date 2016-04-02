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

app.service('$threads', function($firebaseArray, $firebaseObject, FB_URL) {
  var ref = new Firebase(FB_URL);
  var threadsRef = ref.child('threads');

  this.getArray = function() {
    return $firebaseArray(threadsRef);
  };
  this.create = function(subject) {
    return this.getArray().$loaded()
    .then(function(threads) {
      return threads.$add({
        subject: subject
      });
    });
  };
  this.getThread = function(threadId) {
    var singleThreadRef = threadsRef.child(threadId);
    return $firebaseObject(singleThreadRef);
  };
  this.getPosts = function(threadId) {
    var postsRef = threadsRef.child(threadId).child('posts');
    return $firebaseArray(postsRef);
  };
});


// app.factory('$threads', function($firebaseArray, FB_URL) {
//   var ref = new Firebase(FB_URL);
//   var threadsRef = ref.child('threads');

//   return {
//     getArray: function() {
//       return $firebaseArray(threadsRef);
//     },
//     create: function(subject) {
//       return this.getArray().$loaded()
//       .then(function(threads) {
//         return threads.$add({
//           subject: subject
//         });
//       });
//     }
//   };

// });

