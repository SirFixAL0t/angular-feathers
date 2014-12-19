
(function(window, angular, undefined) {
  /*
    angular-feathers
    v0.1.0

    Copyright (c) 2014 Brandon Roberson <broberson@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
  */

  var defaults = {
    idProperty: '_id',
    server: 'http://localhost:3000',
    socketOptions: {
      forceNew: true
    }
  }


  function cb(promise, callback) {
    if(typeof callback == 'function') {
      promise = promise.then(function(data) {
        callback(null, data)
      }, function(err) {
        callback(err)
      })
    }

    return promise
  }




  function resourceFactory(typeName, options) {

    var factory = {
      find: function(params, callback) {
        if(typeof callback == 'undefined' && typeof params == 'function') {
          callback = params
          params = {}
        }

        return cb($q(function(resolve, reject) {
          socket.emit(typeName + '::find', params, function(err, items) {
            if(err)
              return reject(err)
            resolve(items)
          })
        }), callback)
      },

      get: function(id, params, callback) {
        if(typeof callback == 'undefined' && typeof params == 'function') {
          callback = params
          params = {}
        }

        return cb($q(function(resolve, reject) {
          socket.emit(typeName + '::get', id, params, function(err, item) {
            if(err)
              return reject(err)
            resolve(item)
          })
        }), callback)
      },

      create: function(data, params, callback) {
        if(typeof callback == 'undefined' && typeof params == 'function') {
          callback = params
          params = {}
        }

        return cb($q(function(resolve, reject) {
          socket.emit(typeName + '::create', data, params, function(err, item) {
            if(err)
              return reject(err)
            resolve(item)
          })
        }), callback)
      },

      update: function(id, data, params, callback) {
        if(typeof callback == 'undefined' && typeof params == 'function') {
          callback = params
          params = {}
        }

        return cb($q(function(resolve, reject) {
          socket.emit(typeName + '::update', id, data, params, function(err, item) {
            if(err)
              return reject(err)
            resolve(item)
          })
        }), callback)
      },

      patch: function(id, data, params, callback) {
        if(typeof callback == 'undefined' && typeof params == 'function') {
          callback = params
          params = {}
        }

        return cb($q(function(resolve, reject) {
          socket.emit(typeName + '::patch', id, data, params, function(err, item) {
            if(err)
              return reject(err)
            resolve(item)
          })
        }), callback)
      },

      remove: function(id, params, callback) {
        if(typeof callback == 'undefined' && typeof params == 'function') {
          callback = params
          params = {}
        }

        return cb($q(function(resolve, reject) {
          socket.emit(typeName + '::remove', id, params, function(err, item) {
            if(err)
              return reject(err)
            resolve(item)
          })
        }), callback)
      }
    }

    function Resource(attrs) {
      if(!(this instanceof Resource))
        return new Resource(attrs)

      angular.extend(this, attrs)
    }

    angular.extend(Resource, {
      typeName: typeName,
      factory: factory,
      cache: []

      reload: function(id) {
        if(typeof id != 'undefined')
          return this.factory.get(id)
        return this.factory.find()
      },


    })

    angular.extend(Resource.prototype, {
      create: function() {

      },

      update: function() {

      },

      remove: function() {

      }
    })

    return Resource
  }

  angular.module('ngFeathers', [ 'ng' ]).provider('$feathers',
    function() {
      var config = angular.extend({}, defaults)

      this.config = function(options) {
        if(typeof options == 'object')
          angular.extend(config, options)
        return config
      }

      this.$get = [
        '$q', '$rootScope',

        function($q, $rootScope) {

          function apply(fn) {
            var phase = $rootScope.$$phase

            if(phase == '$apply' || phase == '$digest') {
              if(typeof fn == 'function')
                fn()
              return
            }

            $rootScope.$apply(fn)
          }


          function cacheFactory(typeName, sortfn) {
            var cache = []

            cache.value = function(arr) {
              if(typeof arr !== 'undefined') {
                this.splice(0, this.length)
                for(var i = 0; i < arr.length; i++)
                  this.push(arr[i])
                if(typeof sortfn == 'function')
                  this.sort(sortfn)
                apply()
              }
              return cache
            }

            cache.empty = function() {
              this.splice(0, this.length)
              apply()
              return this
            }

            cache.find = function(query) {
              var matches = [],
                len = this.length,
                i = 0,
                j = 0,
                item, prop

              itemloop: for(; i < len; i++) {
                item = this[i]

                for(prop in query) {
                  if(query.hasOwnProperty(prop))
                    if(!item.hasProperty(prop) || query[prop] !== item[prop])
                      break itemloop
                }

                matches.push(item)
              }

              return matches
            }

            cache.indexOfId = function(id) {
              var len = this.length,
                i = 0,
                item

              for(; i < len; i++) {
                item = this[i]
                if(item[config.idProperty] == id)
                  return i
              }

              return -1
            }

            cache.get = function(id) {
              var idx = this.indexOfId(id)

              return idx >= 0 ? this[idx] : undefined
            }

            cache.insert = function(obj) {
              if(typeof obj == 'undefined')
                return

              var idx = this.indexOfId(obj[config.idProperty])

              if(idx >= 0)
                this[idx] = obj
              else
                this.push(obj)

              if(typeof sortfn == 'function')
                this.sort(sortfn)
              apply()
            },

            cache.remove = function(id) {
              if(typeof id == 'object')
                id = id[config.idProperty]

              var idx = this.indexOfId(id)

              if(idx >= 0) {
                this.splice(idx, 1)
                apply()
              }
            }
          }


          function Feathers() {
            this.socket = null
            this.listeners = {}
          }

          angular.extend(Feathers.prototype, {

            connect: function() {
              this.socket = io.connect(config.server, config.socketOptions)
              this.socket.off = this.socket.removeListener
              this.socket.on('connect', this._connected.bind(this))
              this.socket.on('disconnect', this._disconnected.bind(this))
            },

            disconnect: function() {
              if(this.socket) {
                this.socket.disconnect()
                this.socket.destroy()
              }
              this.socket = null
            },

            on: function(event, handler) {
              if(typeof event != 'string')
                throw new Error('Expected event name to be a string.')

              if(typeof handler != 'function')
                throw new Error('Expected event handler to be a function.')

              var handlers = this.listeners[event] = this.listeners[event] || []

              handlers.push(handler)

              return function() {
                this.off(event, handler)
              }.bind(this)
            },

            off: function(event, handler) {
              var handlers = this.listeners[event],
                idx = handlers ? handlers.indexOf(handler) : -1

              if(idx >= 0)
                handlers.splice(idx, 1)
            },

            emit: function(event) {
              var args = Array.prototype.slice.apply(arguments),
                handlers = this.listeners[event],
                len = handlers ? handlers.length : 0,
                i = 0

              args.shift()

              for(; i < len; i++)
                handlers[i].apply(this, args)
            },

            _connected: function() {
              this.emit('connect')
            },

            _disconnected: function() {
              this.emit('disconnect')
            }

          })

          Feathers.config = angular.extend({}, FeathersProvider.defaults)

          return Feathers
        }
      ]



    }
  )


})(window, angular)
