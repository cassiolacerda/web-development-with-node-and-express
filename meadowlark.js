/**
 * Environment
 */
require('dotenv').config();

/**
 * Setup Express
 */
var express = require('express');
var connect = require('connect');
var app = express();
app.set('port', process.env.PORT || 3000);
app.disable('x-powered-by');

/**
 * Global NPM
 */
global.fs = require('fs');
global.https = require('https');
global.appRoot = require('app-root-path');
global.reqlib = require('app-root-path').require;

/**
 * Global Libs
 */
global.credentials = require('./credentials.js');
global.utils = require('./lib/utils.js');
global.regex = require('./lib/regex.js');

/**
 * Static files
 */
app.use(express.static(__dirname + '/public'));

/**
 * Parsers
 */
app.use(require('body-parser').urlencoded({
  extended: true
}));
app.use(require('cookie-parser')(credentials.cookieSecret));

/**
 * Database and Session
 */
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
mongoose.connect(credentials.mongo[app.get('env')].connectionString, {
  promiseLibrary: global.Promise,
  keepAlive: true,
  keepAliveInitialDelay: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var db = mongoose.connection;
db.on('error', function(error) {
  console.error(error);
});
db.once('open', function() {
  console.log('Connected to Database!');
});
app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: credentials.cookieSecret,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

/**
 * Logging
 */
switch (app.get('env')) {
  case 'development':
    app.use(require('morgan')('dev'));
    break;
  case 'production':
    app.use(require('express-logger')({
      path: __dirname + '/log/requests.log'
    }));
    break;
}

/**
 * View Engine
 */
var handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: function(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
    static: function(name) {
      return require('./lib/static.js').map(name);
    }
  }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

/**
 * Switch JavaScript and CSS sources/bundles
 */
app.use(require('connect-bundle')(require('./config.js')));

/**
 * Cluster
 */
app.use(function(req, res, next) {
  var cluster = require('cluster');
  if (cluster.isWorker) console.log('Worker %d received request', cluster.worker.id);
  next();
});

/**
 * Locals
 */
var static = require('./lib/static.js').map;
app.use(function(req, res, next) {
  var now = new Date();
  res.locals.logo = now.getMonth() == 0 && now.getDate() == 28 ? static('/img/logo_bud_clark.png') : static('/img/logo.png');
  next();
});

app.use(function(req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
  next();
});

app.use(function(req, res, next) {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.use(function(req, res, next) {
  if (!res.locals.partials) res.locals.partials = {};
  var weather = require('./lib/weather.js');
  res.locals.partials.weatherContext = weather.getWeatherData();
  next();
});

app.use(/^(?!\/api).+/, require('csurf')());
app.use(/^(?!\/api).+/, function(req, res, next) {
  res.locals._csrfToken = req.csrfToken();
  next();
});

/**
 * Authentication
 */
var auth = require('./lib/auth.js')(app, {
  baseUrl: process.env.BASE_URL,
  providers: credentials.authProviders,
  successRedirect: '/account',
  failureRedirect: '/unauthorized',
});
auth.init();
auth.registerRoutes();

/**
 * Routes (Express.Router Method)
 */
app.use('/', require('./routes/admin.js'));

/**
 * Routes (Handlers Method)
 */
var handlers = require('./handlers.js')(app);

/**
 * Controllers & View Models
 */
var controllers = require('./controllers/customer.js').registerRoutes(app);

/**
 * API Server
 */
app.use('/api', require('cors')());

var Attraction = require('./models/attraction.js');

app.get('/api/attractions', function(req, res) {
  Attraction.find({
    approved: true
  }, function(err, attractions) {
    if (err) return res.status(500).send('Error occurred: database error.');
    res.json(attractions.map(function(a) {
      return {
        name: a.name,
        id: a._id,
        description: a.description,
        location: a.location,
      };
    }));
  });
});

app.post('/api/attraction', function(req, res) {
  var a = new Attraction({
    name: req.body.name,
    description: req.body.description,
    location: {
      lat: req.body.lat,
      lng: req.body.lng
    },
    history: {
      event: 'created',
      email: req.body.email,
      date: new Date(),
    },
    approved: false,
  });
  a.save(function(err, a) {
    if (err) return res.status(500).send('Error occurred: database error.');
    res.json({
      id: a._id
    });
  });
});

app.get('/api/attraction/:id', function(req, res) {
  Attraction.findById(req.params.id, function(err, a) {
    if (err) return res.status(500).send('Error occurred: database error.');
    res.json({
      name: a.name,
      id: a._id,
      description: a.description,
      location: a.location,
    });
  });
});

/**
 * Integrating with Third-Party APIs
 */
var Dealer = require('./models/dealer.js');

app.get('/dealers', function(req, res) {
  res.render('dealers', {
    googleApiKey: credentials.authProviders.google[app.get('env')].apiKeyMapsJavascript
  });
});

function geocodeDealer(dealer) {
  var addr = dealer.getAddress(' ');
  // already geocoded
  if (addr === dealer.geocodedAddress) return;
  if (dealerCache.geocodeCount >= dealerCache.geocodeLimit) {
    // has 24 hours passed since we last started geocoding?
    if (Date.now() > dealerCache.geocodeBegin + 24 * 60 * 60 * 1000) {
      dealerCache.geocodeBegin = Date.now();
      dealerCache.geocodeCount = 0;
    } else {
      // we can't geocode this now: we've reached our usage limit
      return;
    }
  }
  var geocode = require('./lib/geocode.js');
  geocode(app, addr, function(err, coords) {
    if (err) return console.log('Geocoding failure for ' + addr);
    dealer.geocodedAddress = addr;
    dealer.lat = coords.lat;
    dealer.lng = coords.lng;
    dealer.save();
  });
};

function refreshDealerCacheForever() {
  dealerCache.refresh(function() {
    setTimeout(refreshDealerCacheForever, dealerCache.refreshInterval);
  });
};

var dealerCache = {
  lastRefreshed: 0,
  refreshInterval: 30 * 1000,
  jsonFile: __dirname + '/public/dealers.json',
  geocodeLimit: 2000,
  geocodeCount: 0,
  geocodeBegin: 0,
};

dealerCache.refresh = function(cb) {
  Dealer.find({
    active: true
  }, function(err, dealers) {
    if (err) return console.log('Error fetching dealers: ' + err);
    // geocodeDealer will do nothing if coordinates are up-to-date
    dealers.forEach(geocodeDealer);
    // we now write all the dealers out to JSON file
    fs.writeFileSync(dealerCache.jsonFile, JSON.stringify(dealers));
    // all done -- invoke callback
    cb();
  });
};

// create empty cache if it doesn't exist to prevent 404 errors
if (!fs.existsSync(dealerCache.jsonFile)) fs.writeFileSync(dealerCache.jsonFile, JSON.stringify([]));

// start refreshing cache
// refreshDealerCacheForever();

/**
 * Autoviews
 */
var autoViews = {};

app.use(function(req, res, next) {
  var path = req.path.toLowerCase();
  if (autoViews[path]) return res.render(autoViews[path]);
  if (fs.existsSync(__dirname + '/views' + path + '.handlebars')) {
    autoViews[path] = path.replace(/^\//, '');
    return res.render(autoViews[path]);
  }
  next();
});

// /tours/hood-river
// /tours/oregon-coast
// /jquery-test (Sections)
// /nursery-rhyme (Client Handlebars)
// /thank-you (Form Fields 303)
// /newsletter/archive (Form Flash Messages 303)
// /contest/vacation-photo/entries (File Upload Handlers 303)

/**
 * Catch-all and error handlers
 */
app.use(function(req, res, next) {
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  switch (err.code) {
    case 'EBADCSRFTOKEN':
      res.status(403);
      res.send('Form tampered with!');
      break;
    default:
      res.status(500);
      res.render('500');
      break;
  };
});

/**
 * Start Server
 */
function startServer() {
  var options = {
    key: fs.readFileSync(__dirname + '/ssl/meadowlark.pem'),
    cert: fs.readFileSync(__dirname + '/ssl/meadowlark.crt'),
  };
  https.createServer(options, app).listen(app.get('port'), function() {
    console.log('Express started in ' + app.get('env') + ' mode on https://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
  });
}

if (require.main === module) {
  // application run directly; start app server
  startServer();
} else {
  // application imported as a module via "require": export function to create server
  module.exports = startServer;
}

// app.listen(app.get('port'), function() {
//   console.log('Express started in ' + app.get('env') + ' mode on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
// });

/**
 * Console Utils
 */
// console.log(process.env);
