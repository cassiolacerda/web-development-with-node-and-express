var https = require('https');

module.exports = function(app, query, cb) {
  var options = {
    hostname: 'maps.googleapis.com',
    path: '/maps/api/geocode/json?address=' + encodeURIComponent(query) + '&key=' + credentials.authProviders.google[app.get('env')].apiKeyGeocodingAndPlaces,
  };
  https.request(options, function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      data = JSON.parse(data);
      if (data.results.length) {
        cb(null, data.results[0].geometry.location);
      } else {
        cb('No results found.', null);
      }
    });
  }).end();
};
