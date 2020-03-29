/**
 * Private Libs
 */
var fortune = reqlib('/lib/fortune.js');

/**
 * Private Models
 */

/**
 * Handlers
 */

/**
 * Simple View
 */
module.exports.simple_view = function(req, res) {
  res.render('home');
};

/**
 * Dynamic View
 */
module.exports.dynamic_view = function(req, res) {
  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js'
  });
};

/**
 * No Layout
 */
module.exports.no_layout = function(req, res) {
  res.render('tours/request-group-rate', {
    layout: null
  });
};

/**
 * Client Side
 */
module.exports.clientside = function(req, res) {
  res.json({
    animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck',
  });
};
