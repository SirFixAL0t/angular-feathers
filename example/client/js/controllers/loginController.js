
angular.module('app.controllers').controller('loginController',
  function($scope, $state, $http, $rootScope, config, Feathers) {

    $scope.loginData = {
      username: localStorage['username'] || '',
      password: localStorage['password'] || ''
    }

    $scope.loginError = ''

    $scope.login = function() {
      $scope.loginError = ''

      if(!$scope.loginData.username || !$scope.loginData.password) {
        $scope.loginError = 'Please provide a username and password.'
        return
      }

      $http.post(config.server + '/login', $scope.loginData)
        .success(function(data) {
          localStorage['username'] = $scope.loginData.username
          localStorage['password'] = $scope.loginData.password

          data.isAdmin = !!~data.groups.indexOf('admin')
          $rootScope.currentUser = data

          Feathers.connect()
          $state.go('app.users')
        })
        .error(function(data, status) {
          $scope.loginError = data && data.message ? data.message : 'Unable to connect to server.'
        })

    }

  }
)
