
var hooks = require('feathers-hooks'),
  mongodb = require('feathers-mongodb'),
  passport = require('passport'),
  crypto = require('crypto'),
  LocalStrategy = require('passport-local').Strategy

module.exports = function(app) {

  var errors

  // has a password with the given salt
  function hash(string, salt) {
    var sha256 = crypto.createHash('sha256')

    sha256.update(string + salt)
    return sha256.digest('hex')
  }

  // remove password and salt properties from a user
  // before sending it to the client
  function cleanUser(user) {
    delete user.password
    delete user.salt
    return user
  }

  // require authentication before allowing an external
  // service request
  function requiresAuth(hook, next) {
    if(!hook.params.external)
      return next()

    if(!hook.params.user)
      return next(new errors.Forbidden('Forbidden.'))

    if(hook.data) {
      delete hook.data.password
      delete hook.data.salt
    }

    next()
  }

  // clean up a result if it's being sent to the client
  function cleanResult(hook, next) {
    if(!hook.params.external)
      return next()

    cleanUser(hook.result)
    next()
  }

  // the users service
  var userService = mongodb({
    db: app.get('config').mongodb.db,
    collection: 'users'
  }).extend({
    authenticate: function(username, password, callback) {
      this.find({ query: { username: username } }, function(error, users) {
        if(error)
          return callback(error)

        var user = users[0]

        if(!user)
          return callback(new errors.NotFound('Incorrect username or password.'))

        if(user.password !== hash(password, user.salt))
          return callback(new errors.NotFound('Incorrect username or password.'))

        callback(null, cleanUser(user))
      });
    },

    setup: function(app, path) {
      errors = app.errors
      this.app = app

      this.before({
        create: function(hook, next) {
          var salt = crypto.randomBytes(128).toString('base64')

          hook.data.password = hash(hook.data.password, salt)
          hook.data.salt = salt
          next()
        },
        find: requiresAuth,
        get: requiresAuth,
        update: requiresAuth,
        patch: function(hook, next) {
          console.log('users::patch', hook.data)
          requiresAuth(hook, next)
        },
        remove: requiresAuth
      })

      this.after({
        create: cleanResult,
        find: function(hook, next) {
          if(!hook.params.external)
            return next()

          if(Array.isArray(hook.result))
            hook.result = hook.result.map(cleanUser)
          else
            cleanUser(hook.result)

          next()
        },
        get: cleanResult,
        put: cleanResult,
        patch: cleanResult,
        remove: cleanResult
      })

    }
  })

  passport.serializeUser(function(user, done) {
    done(null, user._id)
  })

  passport.deserializeUser(function(id, done) {
    app.service('users').get(id, {}, done)
  })

  passport.use(new LocalStrategy(function(username, password, done) {
    app.service('users').authenticate(username, password, done)
  }))

  userService.passport = passport

  return userService
}