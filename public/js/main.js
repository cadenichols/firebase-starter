'use strict';

var app = angular.module('fireApp', ['firebase', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', { url: '/', templateUrl: 'html/home.html' })
    .state('profile', {
      url: '/profile',
      templateUrl: 'html/profile.html',
      controller: 'profileCtrl',
      resolve: {
        profile: function($authObj, ProfileFactory) {
          return $authObj.$requireAuth().then((authData) => {
            return ProfileFactory(authData.uid).$loaded();
          });
        }
      }
    })
  $urlRouterProvider.otherwise('/');
});


app.controller('profileCtrl', function($scope, $uibModal, $log, profile) {
  $scope.profile = profile;

  $scope.open = function() {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'html/editProfileModal.html',
      controller: 'editProfileModalCtrl',
      size: 'lg',
      resolve: {
        profileToEdit: function() {
          return angular.copy($scope.profile);
        }
      }
    });
    modalInstance.result.then(function(editedProfile) {
      $scope.profile.name = editedProfile.name;
      $scope.profile.color = editedProfile.color;
      $scope.profile.$save();
    }, function() {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});


app.controller('editProfileModalCtrl', function($scope, $uibModalInstance, profileToEdit) {
  $scope.editProfile = profileToEdit;
  $scope.save = function() {
    $uibModalInstance.close($scope.profile);
  };
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
});


app.controller('mainCtrl', function($scope, $tweets, $authObj, ProfileFactory) {
  $scope.tweets = $tweets;
  $scope.authObj = $authObj;

  $scope.authObj.$onAuth(function(authData) {
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


app.factory('$tweets', function($firebaseArray, FB_URL) {
  var ref = new Firebase(FB_URL);
  var tweetsRef = ref.child('tweets');
  return $firebaseArray(tweetsRef);
});

app.factory('$authObj', function($firebaseAuth, FB_URL) {
  var ref = new Firebase(FB_URL);
  return $firebaseAuth(ref);
});

app.constant('FB_URL', 'https://oijoijoijoijoijoijoi.firebaseio.com/');
