
angular.module('app.controllers').controller('userController',
  function($scope, $state, user, groups) {

    // the user we're working with was resolved in the state and
    // injected as 'user'
    $scope.user = user

    // this view supports viewing and editing a user (and is
    // also used for creating a new user, with newUserController
    // running the show instead of this controller)
    $scope.viewMode = true
    $scope.editMode = false

    // a functino for syncing the group selection model
    // with the groups actually present on in user.groups
    function updateGroupSelection() {
      $scope.groups = groups.map(function(g) {
        return {
          name: g,
          selected: !!~$scope.user.groups.indexOf(g)
        }
      })
    }

    // a function for bailing to the users list
    function returnToUsersList() {
      $state.go('app.users')
    }

    // changes to the user from other clients will happen automatically,
    // but our group selection information has to be updated to reflect
    // those changes when they happen
    $scope.user.on('updated', updateGroupSelection)

    // if this user is deleted while we're viewing/editing it, we should bail
    // back to the users list. if we delete this user ourselves with
    // $scope.remove() below, this event will also fire once the deletion occurs
    // on the server and we'll be returned to the user list
    $scope.user.on('removed', returnToUsersList)

    // when this controller is released, we need to remove the event listeners
    // we set above to prevent memory leaks and other mayhem
    $scope.$on('$destroy', function() {
      $scope.user.off('updated', updateGroupSelection)
      $scope.user.off('removed', returnToUsersList)
    })

    // a function for switching back and forth between modes
    function toggleEdit() {
      $scope.editMode = $scope.viewMode
      $scope.viewMode = !$scope.viewMode
    }

    // we'll want to call this directly from the view on occasion
    // as well, so we'll set a reference to it on $scope
    $scope.toggleEdit = toggleEdit

    // delete this user from the backend database
    // (a 'removed' event will be emitted when that's been done)
    $scope.remove = function() {
      $scope.user.destroy()
    }

    // save changes made to a user
    $scope.save = function() {
      var user = $scope.user

      // don't save unless we're in edit mode (some browsers treat
      // a <button> like an <input type="submit">)
      if(!$scope.editMode)
        return

      // non-blank usernames make logging in easier for people
      // but really, some server-side validation might be a
      // better way to go
      if(!user.username)
        return angular.element('#editusername').focus()

      // update the user with the selected groups
      user.groups = $scope.groups
        .filter(function(g) { return g.selected })
        .map(function(g) { return g.name })

      // we don't edit passwords here, that's for newUserController
      // to take care of. if that field has somehow been filled out,
      // don't send it to the server
      delete user.password

      // save the user and toggle back to view mode
      user.save().then(toggleEdit)
    }

    // cancel the changes we've made to the user and revert
    // back to original state -- or rather, the current state
    // according to the backend database
    $scope.cancel = function() {

      // refresh updates the user from the backend database
      $scope.user.refresh().then(function() {
        // update the selected groups
        updateGroupSelection()

        // switch modes (the cancel button is only visible in edit mode)
        toggleEdit()
      })
    }

    // set up the group selection for our inital render of the view
    updateGroupSelection()

  }
)

