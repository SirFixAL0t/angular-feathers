angular.module('app.controllers').controller('newUserController',
  function($scope, $state, user, groups) {

    // a new user instance was created in the state (via resolve)
    $scope.user = user

    // we're reusing the show/edit user view, but in edit mode only
    $scope.viewMode = false
    $scope.editMode = true

    // this user doesn't exist on the server yet, so we don't need
    // to keep the group selection in sync with anything
    $scope.groups = groups.map(function(g) {
      return {
        name: g,
        selected: !!~$scope.user.groups.indexOf(g)
      }
    })

    // after save or cancel, we'll head back to the users list
    function returnToUsersList() {
      $state.go('app.users')
    }

    $scope.cancel = returnToUsersList

    $scope.save = function() {
      var user = $scope.user

      // a little validation for the sake of it
      // but something on the server would be nice
      if(!user.username)
        return angular.element('#editusername').focus()

      if(!user.password)
        return angular.element('#editpassword').focus()

      // set the user's groups to whatever was selected
      user.groups = $scope.groups
        .filter(function(g) { return g.selected })
        .map(function(g) { return g.name })

      // save and return to the users list
      user.save().then(returnToUsersList)
    }

  }
)
