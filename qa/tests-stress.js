require('dotenv').config();
var loadtest = require('loadtest');
var expect = require('chai').expect;

suite('Stress tests', function() {
  test('homepage should handle 50 requests in under a second', function(done) {
    var options = {
      url: process.env.BASE_URL,
      concurrency: 4,
      maxRequests: 150,
    };
    loadtest.loadTest(options, function(err, result) {
      expect(!err);
      expect(result.totalTimeSeconds < 1);
      done();
    });
  });
});
