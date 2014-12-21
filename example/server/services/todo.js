
var mongodb = require('feathers-mongodb')

module.exports = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
}).extend({
  created: function(data, params, callback) {
    // anyone can create a todo
    callback(null, data)

    // // only admins can create a todo
    // if(params.user && ~params.user.groups.indexOf('admin')) {
    //   return callback(null, data)
    // }

    // callback(null, false)
  },

  setup: function(app, path) {
    this.before(function(hook, next) {
      if(!hook.params.user)
        return next(new Error('Not authenticated.'))
      next()
    })
  }
})

