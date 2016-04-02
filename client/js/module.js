'use strict';

var app = angular.module('fireApp', ['firebase', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.constant('FB_URL', 'https://oijoijoijoijoijoijoi.firebaseio.com/');

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
    .state('threads', {
      url: '/threads',
      templateUrl: '/html/threads.html',
      controller: 'threadsCtrl'
    })
    .state('thread-detail', {
      url: '/thread-detail/:threadId',
      templateUrl: '/html/threadDetail.html',
      controller: 'threadDetailCtrl',
      resolve: {
        thread: function($threads, $stateParams) {
          return $threads.getThread($stateParams.threadId).$loaded();
        },
        posts: function($threads, $stateParams) {
          return $threads.getPosts($stateParams.threadId).$loaded();
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
