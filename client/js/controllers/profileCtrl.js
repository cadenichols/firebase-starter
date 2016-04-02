'use strict';

var app = angular.module('fireApp');

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
    $uibModalInstance.close($scope.editProfile);
  };
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
});
