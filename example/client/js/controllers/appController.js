
angular.module('app.controllers').controller('appController',
  function($scope, $state, $http, $rootScope, config, Feathers) {

    $scope.Users = Feathers.service('users')
    $scope.Todos = Feathers.service('todos')

    $scope.showMenu = true

    $scope.toggleMenu = function() {
      $scope.showMenu = !$scope.showMenu
    }

    $scope.logout = function() {
      $http.get(config.server + '/logout')
        .success(function(data) {
          delete $rootScope.currentUser
          Feathers.disconnect()
          $state.go('login')
        })
        .error(function(data, status) {
          delete $rootScope.currentUser
          Feathers.disconnect()
          $state.go('login')
        })
    }


  }
)
