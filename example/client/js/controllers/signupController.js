
angular.module('app.controllers').controller('signupController',
  function($scope, $state, $http, $rootScope, config) {

    $scope.signupData = {}
    $scope.signupError = ''

    $scope.signup = function() {
      $scope.signupError = ''

      if(!$scope.signupData.username || !$scope.signupData.password) {
        $scope.signupError = 'Please provide a username and password.'
        return
      }

      $scope.signupData.groups = [ 'user' ]

      $http.post(config.server + '/users', $scope.signupData)
        .success(function(data) {
          var username = $scope.signupData.username,
            password = $scope.signupData.password

          $http.post(config.server + '/login', {
              username: username,
              password: password
            })
            .success(function(data) {
              localStorage['username'] = username
              localStorage['password'] = password

              data.isAdmin = !!~data.groups.indexOf('admin')
              $rootScope.currentUser = data

              $state.go('app.users')
            })
            .error(function(data, status) {
              $state.go('login')
            })
        })
        .error(function(data, status) {
          $scope.signupError = data && data.message ? data.message : 'Unable to connect to server.'
        })

    }


  }
)
