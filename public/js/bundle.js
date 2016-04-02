'use strict';

var app = angular.module('fireApp', ['firebase', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.constant('FB_URL', 'https://oijoijoijoijoijoijoi.firebaseio.com/');

app.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('home', { url: '/', templateUrl: 'html/home.html' }).state('profile', {
    url: '/profile',
    templateUrl: 'html/profile.html',
    controller: 'profileCtrl',
    resolve: {
      profile: ["$authObj", "ProfileFactory", function ($authObj, ProfileFactory) {
        return $authObj.$requireAuth().then(function (authData) {
          return ProfileFactory(authData.uid).$loaded();
        });
      }]
    }
  }).state('threads', {
    url: '/threads',
    templateUrl: '/html/threads.html',
    controller: 'threadsCtrl'
  }).state('thread-detail', {
    url: '/thread-detail/:threadId',
    templateUrl: '/html/threadDetail.html',
    controller: 'threadDetailCtrl',
    resolve: {
      thread: ["$threads", "$stateParams", function ($threads, $stateParams) {
        return $threads.getThread($stateParams.threadId).$loaded();
      }],
      posts: ["$threads", "$stateParams", function ($threads, $stateParams) {
        return $threads.getPosts($stateParams.threadId).$loaded();
      }]
    }
  });

  $urlRouterProvider.otherwise('/');
}]);

app.filter('reverse', function () {
  return function (items) {
    return items.slice().reverse();
  };
});
'use strict';

var app = angular.module('fireApp');

app.controller('mainCtrl', ["$scope", "$tweets", "$authObj", "ProfileFactory", function ($scope, $tweets, $authObj, ProfileFactory) {
  $scope.tweets = $tweets;
  $scope.authObj = $authObj;

  $scope.authObj.$onAuth(function (authData) {
    $scope.authData = authData;
    if (authData) {
      $scope.profile = ProfileFactory(authData.uid);
    } else {
      $scope.profile = null;
    }
  });

  $scope.logout = function () {
    $scope.authObj.$unauth();
  };

  $scope.register = function (user) {
    $scope.authObj.$createUser(user).then(function (userData) {
      console.log('user created:', userData);
      return $scope.authObj.$authWithPassword(user);
    }).then(function (authData) {
      console.log('user logged in:', authData);
    }).catch(function (err) {
      console.log('err:', err);
    });
  };

  $scope.login = function (user) {
    $scope.authObj.$authWithPassword(user).then(function (authData) {
      console.log('user logged in:', authData);
    }).catch(function (err) {
      console.log('err:', err);
    });
  };
}]);
'use strict';

var app = angular.module('fireApp');

app.controller('profileCtrl', ["$scope", "$uibModal", "$log", "profile", function ($scope, $uibModal, $log, profile) {
  $scope.profile = profile;

  $scope.open = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'html/editProfileModal.html',
      controller: 'editProfileModalCtrl',
      size: 'lg',
      resolve: {
        profileToEdit: function profileToEdit() {
          return angular.copy($scope.profile);
        }
      }
    });
    modalInstance.result.then(function (editedProfile) {
      $scope.profile.name = editedProfile.name;
      $scope.profile.color = editedProfile.color;
      $scope.profile.$save();
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}]);

app.controller('editProfileModalCtrl', ["$scope", "$uibModalInstance", "profileToEdit", function ($scope, $uibModalInstance, profileToEdit) {
  $scope.editProfile = profileToEdit;
  $scope.save = function () {
    $uibModalInstance.close($scope.editProfile);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };
}]);
'use strict';

var app = angular.module('fireApp');

app.controller('threadDetailCtrl', ["$scope", "$state", "thread", "posts", function ($scope, $state, thread, posts) {
  $scope.thread = thread;
  $scope.posts = posts;

  console.log('$scope.authData:', $scope.authData);
  console.log('$scope.profile:', $scope.profile);

  $scope.addPost = function () {
    if ($scope.authData) {
      var newPost = {
        text: $scope.newPost.text,
        name: $scope.profile.name,
        color: $scope.profile.color
      };
      $scope.posts.$add(newPost);
      $scope.newPost = {};
    }
  };
}]);
'use strict';

var app = angular.module('fireApp');

app.controller('threadsCtrl', ["$scope", "$threads", function ($scope, $threads) {

  console.log('threadsCtrl!!!');
  $scope.threads = $threads.getArray(); // Three-way data-binding!!!

  $scope.threads.$loaded().then(function (threads) {
    console.log('first thread:', threads[0]);
  });

  $scope.addThread = function () {
    $threads.create($scope.newThread.subject);
    // .then(function(ref) {
    //   console.log('ref:', ref);
    // })
    // .catch(function(err) {
    //   console.log('err:', err);
    // })
    $scope.newThread = {};
  };
}]);
'use strict';

var app = angular.module('fireApp');

app.factory('ProfileFactory', ["$firebaseObject", "FB_URL", function ($firebaseObject, FB_URL) {
  return function (uid) {
    if (!uid) {
      return {};
    };
    var profilesRef = new Firebase(FB_URL + 'profiles');
    var userRef = profilesRef.child(uid);
    return $firebaseObject(userRef);
  };
}]);

app.factory('$tweets', ["$firebaseArray", "FB_URL", function ($firebaseArray, FB_URL) {
  var ref = new Firebase(FB_URL);
  var tweetsRef = ref.child('tweets');
  return $firebaseArray(tweetsRef);
}]);

app.factory('$authObj', ["$firebaseAuth", "FB_URL", function ($firebaseAuth, FB_URL) {
  var ref = new Firebase(FB_URL);
  return $firebaseAuth(ref);
}]);

app.service('$threads', ["$firebaseArray", "$firebaseObject", "FB_URL", function ($firebaseArray, $firebaseObject, FB_URL) {
  var ref = new Firebase(FB_URL);
  var threadsRef = ref.child('threads');

  this.getArray = function () {
    return $firebaseArray(threadsRef);
  };
  this.create = function (subject) {
    return this.getArray().$loaded().then(function (threads) {
      return threads.$add({
        subject: subject
      });
    });
  };
  this.getThread = function (threadId) {
    var singleThreadRef = threadsRef.child(threadId);
    return $firebaseObject(singleThreadRef);
  };
  this.getPosts = function (threadId) {
    var postsRef = threadsRef.child(threadId).child('posts');
    return $firebaseArray(postsRef);
  };
}]);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNvbnRyb2xsZXJzL21haW5DdHJsLmpzIiwiY29udHJvbGxlcnMvcHJvZmlsZUN0cmwuanMiLCJjb250cm9sbGVycy90aHJlYWREZXRhaWxDdHJsLmpzIiwiY29udHJvbGxlcnMvdGhyZWFkc0N0cmwuanMiLCJzZXJ2aWNlcy9mYWN0b3JpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsSUFBSSxNQUFNLFFBQVEsTUFBUixDQUFlLFNBQWYsRUFBMEIsQ0FBQyxVQUFELEVBQWEsV0FBYixFQUEwQixjQUExQixFQUEwQyxXQUExQyxDQUExQixDQUFOOztBQUVKLElBQUksUUFBSixDQUFhLFFBQWIsRUFBdUIsOENBQXZCOztBQUVBLElBQUksTUFBSixDQUFJLENBQUEsZ0JBQUEsRUFBQSxvQkFBQSxFQUFPLFVBQVMsY0FBVCxFQUF5QixrQkFBekIsRUFBNkM7QUFDdEQsaUJBQ0csS0FESCxDQUNTLE1BRFQsRUFDaUIsRUFBRSxLQUFLLEdBQUwsRUFBVSxhQUFhLGdCQUFiLEVBRDdCLEVBRUcsS0FGSCxDQUVTLFNBRlQsRUFFb0I7QUFDaEIsU0FBSyxVQUFMO0FBQ0EsaUJBQWEsbUJBQWI7QUFDQSxnQkFBWSxhQUFaO0FBQ0EsYUFBUztBQUNQLGVBQUEsQ0FBQSxVQUFBLEVBQUEsZ0JBQUEsRUFBUyxVQUFTLFFBQVQsRUFBbUIsY0FBbkIsRUFBbUM7QUFDMUMsZUFBTyxTQUFTLFlBQVQsR0FBd0IsSUFBeEIsQ0FBNkIsVUFBQSxRQUFBLEVBQUE7QUFDbEMsaUJBQU8sZUFBZSxTQUFTLEdBQVQsQ0FBZixDQUE2QixPQUE3QixFQUFQLENBRGtDO1NBQUEsQ0FBcEMsQ0FEMEM7T0FBbkMsQ0FBVDtLQURGO0dBTkosRUFjRyxLQWRILENBY1MsU0FkVCxFQWNvQjtBQUNoQixTQUFLLFVBQUw7QUFDQSxpQkFBYSxvQkFBYjtBQUNBLGdCQUFZLGFBQVo7R0FqQkosRUFtQkcsS0FuQkgsQ0FtQlMsZUFuQlQsRUFtQjBCO0FB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QWUsUUFBZixDQUFQLENBRmlDO0dBQW5CLENBbkJ3RDtDQUFsRCxDQUF4QiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZmlyZUFwcCcsIFsnZmlyZWJhc2UnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnXSk7XG5cbmFwcC5jb25zdGFudCgnRkJfVVJMJywgJ2h0dHBzOi8vb2lqb2lqb2lqb2lqb2lqb2lqb2kuZmlyZWJhc2Vpby5jb20vJyk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnaG9tZScsIHsgdXJsOiAnLycsIHRlbXBsYXRlVXJsOiAnaHRtbC9ob21lLmh0bWwnIH0pXG4gICAgLnN0YXRlKCdwcm9maWxlJywge1xuICAgICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdodG1sL3Byb2ZpbGUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAncHJvZmlsZUN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBwcm9maWxlOiBmdW5jdGlvbigkYXV0aE9iaiwgUHJvZmlsZUZhY3RvcnkpIHtcbiAgICAgICAgICByZXR1cm4gJGF1dGhPYmouJHJlcXVpcmVBdXRoKCkudGhlbigoYXV0aERhdGEpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBQcm9maWxlRmFjdG9yeShhdXRoRGF0YS51aWQpLiRsb2FkZWQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCd0aHJlYWRzJywge1xuICAgICAgdXJsOiAnL3RocmVhZHMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvaHRtbC90aHJlYWRzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ3RocmVhZHNDdHJsJ1xuICAgIH0pXG4gICAgLnN0YXRlKCd0aHJlYWQtZGV0YWlsJywge1xuICAgICAgdXJsOiAnL3RocmVhZC1kZXRhaWwvOnRocmVhZElkJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL2h0bWwvdGhyZWFkRGV0YWlsLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ3RocmVhZERldGFpbEN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0aHJlYWQ6IGZ1bmN0aW9uKCR0aHJlYWRzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICByZXR1cm4gJHRocmVhZHMuZ2V0VGhyZWFkKCRzdGF0ZVBhcmFtcy50aHJlYWRJZCkuJGxvYWRlZCgpO1xuICAgICAgICB9LFxuICAgICAgICBwb3N0czogZnVuY3Rpb24oJHRocmVhZHMsICRzdGF0ZVBhcmFtcykge1xuICAgICAgICAgIHJldHVybiAkdGhyZWFkcy5nZXRQb3N0cygkc3RhdGVQYXJhbXMudGhyZWFkSWQpLiRsb2FkZWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbmFwcC5maWx0ZXIoJ3JldmVyc2UnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgcmV0dXJuIGl0ZW1zLnNsaWNlKCkucmV2ZXJzZSgpO1xuICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZmlyZUFwcCcpO1xuXG5hcHAuY29udHJvbGxlcignbWFpbkN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICR0d2VldHMsICRhdXRoT2JqLCBQcm9maWxlRmFjdG9yeSkge1xuICAkc2NvcGUudHdlZXRzID0gJHR3ZWV0cztcbiAgJHNjb3BlLmF1dGhPYmogPSAkYXV0aE9iajtcblxuICAkc2NvcGUuYXV0aE9iai4kb25BdXRoKGZ1bmN0aW9uKGF1dGhEYXRhKSB7XG4gICAgJHNjb3BlLmF1dGhEYXRhID0gYXV0aERhdGE7XG4gICAgaWYoYXV0aERhdGEpIHtcbiAgICAgICRzY29wZS5wcm9maWxlID0gUHJvZmlsZUZhY3RvcnkoYXV0aERhdGEudWlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnByb2ZpbGUgPSBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5hdXRoT2JqLiR1bmF1dGgoKTtcbiAgfTtcblxuICAkc2NvcGUucmVnaXN0ZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgJHNjb3BlLmF1dGhPYmouJGNyZWF0ZVVzZXIodXNlcilcbiAgICAudGhlbihmdW5jdGlvbih1c2VyRGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ3VzZXIgY3JlYXRlZDonLCB1c2VyRGF0YSk7XG4gICAgICByZXR1cm4gJHNjb3BlLmF1dGhPYmouJGF1dGhXaXRoUGFzc3dvcmQodXNlcik7XG4gICAgfSlcbiAgICAudGhlbihmdW5jdGlvbihhdXRoRGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ3VzZXIgbG9nZ2VkIGluOicsIGF1dGhEYXRhKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdlcnI6JywgZXJyKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgJHNjb3BlLmF1dGhPYmouJGF1dGhXaXRoUGFzc3dvcmQodXNlcilcbiAgICAudGhlbihmdW5jdGlvbihhdXRoRGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ3VzZXIgbG9nZ2VkIGluOicsIGF1dGhEYXRhKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdlcnI6JywgZXJyKTtcbiAgICB9KTtcbiAgfTtcblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZmlyZUFwcCcpO1xuXG5hcHAuY29udHJvbGxlcigncHJvZmlsZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICR1aWJNb2RhbCwgJGxvZywgcHJvZmlsZSkge1xuICAkc2NvcGUucHJvZmlsZSA9IHByb2ZpbGU7XG5cbiAgJHNjb3BlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAnaHRtbC9lZGl0UHJvZmlsZU1vZGFsLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ2VkaXRQcm9maWxlTW9kYWxDdHJsJyxcbiAgICAgIHNpemU6ICdsZycsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHByb2ZpbGVUb0VkaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBhbmd1bGFyLmNvcHkoJHNjb3BlLnByb2ZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbihlZGl0ZWRQcm9maWxlKSB7XG4gICAgICAkc2NvcGUucHJvZmlsZS5uYW1lID0gZWRpdGVkUHJvZmlsZS5uYW1lO1xuICAgICAgJHNjb3BlLnByb2ZpbGUuY29sb3IgPSBlZGl0ZWRQcm9maWxlLmNvbG9yO1xuICAgICAgJHNjb3BlLnByb2ZpbGUuJHNhdmUoKTtcbiAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICRsb2cuaW5mbygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XG4gICAgfSk7XG4gIH07XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2VkaXRQcm9maWxlTW9kYWxDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkdWliTW9kYWxJbnN0YW5jZSwgcHJvZmlsZVRvRWRpdCkge1xuICAkc2NvcGUuZWRpdFByb2ZpbGUgPSBwcm9maWxlVG9FZGl0O1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICR1aWJNb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5lZGl0UHJvZmlsZSk7XG4gIH07XG4gICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkdWliTW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmaXJlQXBwJyk7XG5cbmFwcC5jb250cm9sbGVyKCd0aHJlYWREZXRhaWxDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIHRocmVhZCwgcG9zdHMpIHtcbiAgJHNjb3BlLnRocmVhZCA9IHRocmVhZDtcbiAgJHNjb3BlLnBvc3RzID0gcG9zdHM7XG5cblxuICBjb25zb2xlLmxvZygnJHNjb3BlLmF1dGhEYXRhOicsICRzY29wZS5hdXRoRGF0YSk7XG4gIGNvbnNvbGUubG9nKCckc2NvcGUucHJvZmlsZTonLCAkc2NvcGUucHJvZmlsZSk7XG5cbiAgJHNjb3BlLmFkZFBvc3QgPSBmdW5jdGlvbigpIHtcbiAgICBpZigkc2NvcGUuYXV0aERhdGEpIHtcbiAgICAgIHZhciBuZXdQb3N0ID0ge1xuICAgICAgICB0ZXh0OiAkc2NvcGUubmV3UG9zdC50ZXh0LFxuICAgICAgICBuYW1lOiAkc2NvcGUucHJvZmlsZS5uYW1lLFxuICAgICAgICBjb2xvcjogJHNjb3BlLnByb2ZpbGUuY29sb3JcbiAgICAgIH07XG4gICAgICAkc2NvcGUucG9zdHMuJGFkZChuZXdQb3N0KTtcbiAgICAgICRzY29wZS5uZXdQb3N0ID0ge307XG4gICAgfVxuICB9O1xuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmaXJlQXBwJyk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ3RocmVhZHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkdGhyZWFkcykge1xuXG4gIGNvbnNvbGUubG9nKCd0aHJlYWRzQ3RybCEhIScpO1xuICAkc2NvcGUudGhyZWFkcyA9ICR0aHJlYWRzLmdldEFycmF5KCk7IC8vIFRocmVlLXdheSBkYXRhLWJpbmRpbmchISFcblxuICAkc2NvcGUudGhyZWFkcy4kbG9hZGVkKCkudGhlbihmdW5jdGlvbih0aHJlYWRzKSB7XG4gICAgY29uc29sZS5sb2coJ2ZpcnN0IHRocmVhZDonLCB0aHJlYWRzWzBdKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmFkZFRocmVhZCA9IGZ1bmN0aW9uKCkge1xuICAgICR0aHJlYWRzLmNyZWF0ZSgkc2NvcGUubmV3VGhyZWFkLnN1YmplY3QpXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24ocmVmKSB7XG4gICAgLy8gICBjb25zb2xlLmxvZygncmVmOicsIHJlZik7XG4gICAgLy8gfSlcbiAgICAvLyAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgLy8gICBjb25zb2xlLmxvZygnZXJyOicsIGVycik7XG4gICAgLy8gfSlcbiAgICAkc2NvcGUubmV3VGhyZWFkID0ge307XG4gIH07XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZpcmVBcHAnKTtcblxuYXBwLmZhY3RvcnkoJ1Byb2ZpbGVGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCBGQl9VUkwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVpZCkge1xuICAgIGlmKCF1aWQpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9O1xuICAgIHZhciBwcm9maWxlc1JlZiA9IG5ldyBGaXJlYmFzZShGQl9VUkwgKyAncHJvZmlsZXMnKTtcbiAgICB2YXIgdXNlclJlZiA9IHByb2ZpbGVzUmVmLmNoaWxkKHVpZCk7XG4gICAgcmV0dXJuICRmaXJlYmFzZU9iamVjdCh1c2VyUmVmKTtcbiAgfTtcbn0pO1xuXG5hcHAuZmFjdG9yeSgnJHR3ZWV0cycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGQl9VUkwpIHtcbiAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGQl9VUkwpO1xuICB2YXIgdHdlZXRzUmVmID0gcmVmLmNoaWxkKCd0d2VldHMnKTtcbiAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHR3ZWV0c1JlZik7XG59KTtcblxuYXBwLmZhY3RvcnkoJyRhdXRoT2JqJywgZnVuY3Rpb24oJGZpcmViYXNlQXV0aCwgRkJfVVJMKSB7XG4gIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoRkJfVVJMKTtcbiAgcmV0dXJuICRmaXJlYmFzZUF1dGgocmVmKTtcbn0pO1xuXG5hcHAuc2VydmljZSgnJHRocmVhZHMnLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBGQl9VUkwpIHtcbiAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGQl9VUkwpO1xuICB2YXIgdGhyZWFkc1JlZiA9IHJlZi5jaGlsZCgndGhyZWFkcycpO1xuXG4gIHRoaXMuZ2V0QXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkodGhyZWFkc1JlZik7XG4gIH07XG4gIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24oc3ViamVjdCkge1xuICAgIHJldHVybiB0aGlzLmdldEFycmF5KCkuJGxvYWRlZCgpXG4gICAgLnRoZW4oZnVuY3Rpb24odGhyZWFkcykge1xuICAgICAgcmV0dXJuIHRocmVhZHMuJGFkZCh7XG4gICAgICAgIHN1YmplY3Q6IHN1YmplY3RcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuICB0aGlzLmdldFRocmVhZCA9IGZ1bmN0aW9uKHRocmVhZElkKSB7XG4gICAgdmFyIHNpbmdsZVRocmVhZFJlZiA9IHRocmVhZHNSZWYuY2hpbGQodGhyZWFkSWQpO1xuICAgIHJldHVybiAkZmlyZWJhc2VPYmplY3Qoc2luZ2xlVGhyZWFkUmVmKTtcbiAgfTtcbiAgdGhpcy5nZXRQb3N0cyA9IGZ1bmN0aW9uKHRocmVhZElkKSB7XG4gICAgdmFyIHBvc3RzUmVmID0gdGhyZWFkc1JlZi5jaGlsZCh0aHJlYWRJZCkuY2hpbGQoJ3Bvc3RzJyk7XG4gICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHBvc3RzUmVmKTtcbiAgfTtcbn0pO1xuXG5cbi8vIGFwcC5mYWN0b3J5KCckdGhyZWFkcycsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCBGQl9VUkwpIHtcbi8vICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZShGQl9VUkwpO1xuLy8gICB2YXIgdGhyZWFkc1JlZiA9IHJlZi5jaGlsZCgndGhyZWFkcycpO1xuXG4vLyAgIHJldHVybiB7XG4vLyAgICAgZ2V0QXJyYXk6IGZ1bmN0aW9uKCkge1xuLy8gICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHRocmVhZHNSZWYpO1xuLy8gICAgIH0sXG4vLyAgICAgY3JlYXRlOiBmdW5jdGlvbihzdWJqZWN0KSB7XG4vLyAgICAgICByZXR1cm4gdGhpcy5nZXRBcnJheSgpLiRsb2FkZWQoKVxuLy8gICAgICAgLnRoZW4oZnVuY3Rpb24odGhyZWFkcykge1xuLy8gICAgICAgICByZXR1cm4gdGhyZWFkcy4kYWRkKHtcbi8vICAgICAgICAgICBzdWJqZWN0OiBzdWJqZWN0XG4vLyAgICAgICAgIH0pO1xuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuLy8gICB9O1xuXG4vLyB9KTtcblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
