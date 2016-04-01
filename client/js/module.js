'use strict';

var app = angular.module('fireApp', ['firebase', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.constant('FB_URL', 'PUT YOUR FIREBASE URL HERE');

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

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});
