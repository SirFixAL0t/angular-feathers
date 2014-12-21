
var config = {
  session: {
    name: 'sid',
    secret: 'this is the end of the world as we know it, and i feel fine',
    cookie: {
      maxAge: 24 * 60* 60 * 1000
    },
    resave: false,
    saveUninitialized: true
  },
  mongodb: {
    db: 'angular-feathers-example',
    clear_interval: 3600
  }
}

var feathers = require('feathers'),
  _ = require('feathers/node_modules/lodash'),
  favicon = require('serve-favicon'),
  morgan = require('morgan'),
  logger = require('feathers-logger'),
  bodyParser = require('body-parser'),
  cors = require('express-cors'),
  hooks = require('feathers-hooks'),
  connectMongo = require('connect-mongo'),
  feathersPassport = require('feathers-passport')

var app = feathers()

app.set('config', config)

var userService = require('./services/user')(app),
  todoService = require('./services/todo')


app
  // support REST
  .configure(feathers.rest())

  // support socket.io
  .configure(feathers.socketio(function(io) {

    // log connects and disconnects
    io.on('connection', function(socket){
      app.log({ id: socket.id, status: 'connected' });
      socket.on('disconnect', function() {
        app.log({ id: socket.id, status: 'disconnected' })
      })
    })

    // note the source of incoming socket.io requests
    io.use(function(socket, next) {
      if(!socket.feathers)
        socket.feathers = {}

      socket.feathers.external = 'socketio'
      next()
    })
  }))

  // serve favicon requests from the server directory
  .use(favicon(__dirname + '/favicon.ico'))

  // serve static files from the client directory
  .use('/', feathers.static(__dirname + '/../client'))

  // use morgan for logging
  .configure(logger(app.logger = morgan('dev', {})))

  // parse JSON and urlencoded request body content
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

  // use feathers-hooks
  .configure(hooks())

  // enable cross-origin requests from other ports on localhost
  // since this is just a demo
  // .use(cors({
  //   allowedOrigins: [ 'http://localhost:*' ]
  // }))

  // use feathers-passport for authentication
  .configure(feathersPassport(function(result) {
    var MongoStore = connectMongo(result.createSession)

    return _.extend(result, config.session, {
      store: new MongoStore(config.mongodb, function() {
        app.listen(3000)
        console.log('listening on port 3000')
      })
    })
  }))

  // note the source of incoming REST requests
  .use(function(req, res, next) {
    req.feathers.external = 'rest';
    next();
  })

  // mount the user service
  .use('/users', userService)

  // add routes for logging in and out with passport
  .post('/login', userService.passport.authenticate('local'), function(req, res) {
    res.format({
      html: function() { res.redirect('/') },
      json: function() { res.json(req.user) }
    })
  })
  .get('/logout', function(req, res) {
    req.logout()
    res.format({
      html: function() { res.redirect('/') },
      json: function() { res.json({ message: 'logged out.' }) }
    })
  })
  .get('/whoami', function(req, res) {
    if(!req.user)
      return res.json({})
    app.service('users').get(req.user._id, req.feathers, function(err, user) {
      if(err)
        res.json(err)
      res.json(user)
    })
  })

  // mount the todo service
  .use('/todos', todoService)

  // use feathers-errors for error handling
  .configure(feathers.errors())

// workaround for a bug in feathers-errors
// app.logger = {}
