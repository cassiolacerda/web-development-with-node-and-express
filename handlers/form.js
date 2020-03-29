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
 * Fields
 */
module.exports.fieldsHTML = function(req, res) {
  res.render('newsletter', {
    action: '/newsletter',
    // action: '/process?form=newsletter',
    csrf: 'CSRF token goes here'
  });
};

module.exports.fieldsRead = function(req, res) {
  console.log('Form (from querystring): ' + req.query.form);
  console.log('CSRF token (from hidden form field): ' + req.body._csrf);
  console.log('Name (from visible form field): ' + req.body.name);
  console.log('Email (from visible form field): ' + req.body.email);
  if (req.xhr || req.accepts('json,html') === 'json') {
    res.send({
      success: true
    });
  } else {
    res.redirect(303, '/thank-you');
  }
};

/**
 * Flash Messages
 */
module.exports.flashMessages = function(req, res) {
  var name = req.body.name || '';
  var email = req.body.email || '';
  if (!email.match(regex.VALID_EMAIL_REGEX)) {
    if (req.xhr) {
      return res.json({
        error: 'Invalid name email address.'
      });
    } else {
      req.session.flash = {
        type: 'danger',
        intro: 'Validation error!',
        message: 'The email address you entered was  not valid.',
      };
      return res.redirect(303, '/newsletter/archive');
    }
  }
  if (req.xhr) {
    res.json({
      success: true
    });
  } else {
    req.session.flash = {
      type: 'success',
      intro: 'Validation success!',
      message: 'All informations that you entered were valid.',
    };
    res.redirect(303, '/newsletter/archive');
  }
};

/**
 * File Upload
 */
var dataDir = appRoot + '/data';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

module.exports.uploadHTML = function(req, res) {
  var now = new Date();
  res.render('contest/vacation-photo', {
    year: now.getFullYear(),
    month: now.getMonth()
  });
};

module.exports.uploadSave = function(req, res) {
  var formidable = require('formidable');
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      res.session.flash = {
        type: 'danger',
        intro: 'Oops!',
        message: 'There was an error processing your submission. Please try again.',
      };
      return res.redirect(303, '/contest/vacation-photo');
    }
    var dir = vacationPhotoDir + '/' + Date.now();
    fs.mkdirSync(dir);
    var photo = files.photo;
    var savepath = dir + '/' + photo.name;
    fs.renameSync(photo.path, savepath); // move file
    req.session.flash = {
      type: 'success',
      intro: 'Good luck!',
      message: 'You have been entered into the contest.',
    };
    return res.redirect(303, '/contest/vacation-photo/entries');
  });
};
