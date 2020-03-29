/**
 * Import All Handlers
 */
var handlebars = require('./handlers/handlebars.js');
var form = require('./handlers/form.js');
var database = require('./handlers/database.js');
var samples = require('./handlers/samples.js');

module.exports = function(app) {

  /**
   * Handlebars
   */
  app.get('/', handlebars.simple_view);
  app.get('/about', handlebars.dynamic_view);
  app.get('/tours/request-group-rate', handlebars.no_layout);
  app.get('/data/nursery-rhyme', handlebars.clientside);

  /**
   * Form
   */
  app.get('/newsletter', form.fieldsHTML);
  app.post('/process', form.fieldsRead);
  app.post('/newsletter', form.flashMessages);
  app.get('/contest/vacation-photo', form.uploadHTML);
  app.post('/contest/vacation-photo/:year/:month', form.uploadSave);

  /**
   * Database
   */
  app.get('/vacations/create', database.create);
  app.get('/vacations', database.list);
  app.get('/vacation/:vacation', database.product);
  app.get('/notify-me-when-in-season', database.notifyHTML);
  app.post('/notify-me-when-in-season', database.notifySave);
  app.get('/set-currency/:currency', database.session);

  /**
   * Samples
   */
  app.get('/fail', samples.simpleFail);
  app.get('/epic-fail', samples.crashFail);
  app.get('/console/headers', samples.consoleHeaders);
  app.get('/console/cookies', samples.consoleCookies);
  app.get('/staff/:city/:name', samples.routeParameters);
  app.get(/crazy|mad(ness)?|lunacy/, samples.routeRegex);
  // app.get('/foo', samples.routeFunctions);

};

/**
 * Other Routing Techniques
 */
 // https://www.npmjs.com/package/express-namespace
 // https://www.npmjs.com/package/express-resource
