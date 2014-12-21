

var config = {
  server: 'http://localhost:3000'
}


angular.module('app', [
    'ui.router',
    'multi-select',
    'ngFeathers',
    'app.controllers',
    'app.services',
    'app.directives'
  ])

  .config(function($stateProvider, $urlRouterProvider, $httpProvider, FeathersProvider) {

    FeathersProvider.defaults.server = config.server

    // include cookies in $http requests
    $httpProvider.defaults.withCredentials = true

    // application statemap
    $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginController'
      })

      .state('signup', {
        url: '/signup',
        templateUrl: 'templates/signup.html',
        controller: 'signupController'
      })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/main.html',
        controller: 'appController',
        data: {
          groups: [ 'admin', 'manager', 'user' ]
        }
      })

      .state('app.users', {
        url: '/users',
        data: {
          groups: [ 'admin', 'manager' ]
        },
        views: {
          'appContent': {
            templateUrl: 'templates/users.html',
            controller: 'usersController'
          }
        }
      })

      .state('app.newuser', {
        url: '/users/new',
        resolve: {
          user: function(Feathers) {
            return Feathers.service('users').new({
              username: '',
              password: '',
              groups: [ 'user' ]
            })
          },
          groups: function($rootScope) {
            return $rootScope.groups
          }
        },
        views: {
          'appContent': {
            templateUrl: 'templates/user.html',
            controller: 'newUserController'
          }
        }
      })

      .state('app.user', {
        url: '/user/:id',
        resolve: {
          user: function(Feathers, $stateParams) {
            return Feathers.service('users').get($stateParams.id)
          },
          groups: function($rootScope) {
            return $rootScope.groups
          }
        },
        views: {
          'appContent': {
            templateUrl: 'templates/user.html',
            controller: 'userController'
          }
        }
      })

    $urlRouterProvider.otherwise('/login')

  })

  .value('config', config)

  .run(function($rootScope, $http, $state, $q) {

    $rootScope.log = function(obj) {
      console.log(obj)
    }

    $rootScope.users = [
      { id: 1, username: 'brandon', password: 'rubbish', groups: [ 'admin', 'user' ] },
      { id: 2, username: 'flip', password: 'passwords', groups: [ 'admin', 'user' ] },
      { id: 3, username: 'gentry', password: '4lousy', groups: [ 'manager', 'user' ] },
      { id: 4, username: 'phillip', password: 'security', groups: [ 'user' ] },
      { id: 5, username: 'andrea', password: 'random', groups: [ 'user' ] }
    ]

    $rootScope.groups = [
      'admin',
      'manager',
      'user'
    ]

    $rootScope.$on('$stateChangeStart', function(e, to, params) {

      function getCurrentUser() {
        return $q(function(resolve, reject) {
          if($rootScope.currentUser)
            return resolve($rootScope.currentUser)

          $http.get(config.server + '/whoami')
            .success(function(data) {
              if(data && data._id && data.username) {
                data.isAdmin = !!~data.groups.indexOf('admin')
                $rootScope.currentUser = data
                return resolve($rootScope.currentUser)
              }
              reject()
            })
        })
      }

      function checkGroupMembership() {
        var i = 0,
          len = to.data.groups.length,
          user = $rootScope.currentUser,
          group

        if(!user)
          return false

        for(; i < len; i++) {
          group = to.data.groups[i]
          if(~user.groups.indexOf(group))
            return true
        }
        return false
      }

      function disallowOnError() { return false }

      function navigate(allowed) {
        if(allowed)
          $state.go(to.name, params)
        else
          $state.go('login')

      }

      var hasGroupMembership = false

      if(to && to.data && to.data.groups) {
        if($rootScope.currentUser) {
          if(!checkGroupMembership()) {
            e.preventDefault()
            $state.go('login')
          }
        } else {
          e.preventDefault()
          getCurrentUser()
            .then(checkGroupMembership, disallowOnError)
            .then(navigate)
        }
      }
    })


  })



angular.module('app.controllers', [ 'app.services' ])
angular.module('app.services', [])
angular.module('app.directives', [])
