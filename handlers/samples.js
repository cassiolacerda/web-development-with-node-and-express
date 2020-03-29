/**
 * Private Libs
 */

/**
 * Private Models
 */

/**
 * Handlers
 */

/**
 * Fails
 */
module.exports.simpleFail = function(req, res) {
  throw new Error('Nope!');
};

module.exports.crashFail = function(req, res) {
  process.nextTick(function() {
    throw new Error('Kaboom!');
  });
};

/**
 * Route Parameters
 */
var staff = {
  portland: {
    mitch: {
      bio: 'Mitch is the man to have at your back.'
    },
    madeline: {
      bio: 'Madeline is our Oregon expert.'
    },
  },
  bend: {
    walt: {
      bio: 'Walt is our Oregon Coast expert.'
    },
  },
};

module.exports.routeParameters = function(req, res, next) {
  var bio = staff[req.params.city][req.params.name];
  if (!bio) return next(); // will eventually fall through to 404
  res.send(bio);
};

/**
 * Route Regex
 */
module.exports.routeRegex = function(req, res) {
  res.send('Regex Matched!');
};

/**
 * Route Functions (Fix)
 */
// module.exports.routeFunctions =
//   function(req, res, next) {
//     if (Math.random() < 0.33) return next();
//     res.send('red');
//   },
//   function(req, res, next) {
//     if (Math.random() < 0.5) return next();
//     res.send('green');
//   },
//   function(req, res) {
//     res.send('blue');
//   };

/**
 * Console
 */
module.exports.consoleHeaders = function(req, res) {
  for (var name in req.headers) console.log(name + ': ' + req.headers[name]);
  res.send('');
};

module.exports.consoleCookies = function(req, res) {
  // res.cookie('monster', 'public');
  // res.clearCookie('monster');
  // res.cookie('signed_monster', 'private', { signed: true });
  // res.clearCookie('signed_monster');
  for (var name in req.signedCookies) console.log(name + ': ' + req.signedCookies[name]);
  res.send('');
};
