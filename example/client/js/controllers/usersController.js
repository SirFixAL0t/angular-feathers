
angular.module('app.controllers').controller('usersController',
  function($scope, $state, Feathers) {

    $scope.showUser = function(user) {
      $state.go('app.user', { username: user.username })
    }

    $scope.connectLink = 'Connect'

    Feathers.on('connect', function() {
      $scope.connectLink = 'Disconnect'
    })

    Feathers.on('disconnect', function() {
      $scope.connectLink = 'Connect'
    })

    $scope.toggleConnection = function() {
      Feathers.isConnected ? Feathers.disconnect() : Feathers.connect()
    }

    $scope.justBob = function() {
      Feathers.service('users')
        .refresh({ username: 'bob' })
        .catch(function(err) {
          console.log(err.message)
        })
    }

    $scope.everyone = function() {
      Feathers.service('users')
        .refresh({})
        .catch(function(err) {
          console.log(err.message)
        })
    }

  }
)
