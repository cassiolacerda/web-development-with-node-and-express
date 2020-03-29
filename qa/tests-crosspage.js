require('dotenv').config();
var Browser = require('zombie');
var assert = require('chai').assert;
var browser;

suite('Cross-Page Tests', function(){
	setup(function(){
		browser = new Browser({strictSSL: false});
		base = process.env.BASE_URL;
	});
	// test('requesting a group rate quote from the hood river tour page should ' + 'populate the hidden referrer field correctly', function(done){
	// 	var referrer = base + '/tours/hood-river';
	// 	browser.visit(referrer, function(){
	// 		browser.clickLink('.requestGroupRate', function(){
	// 			assert(browser.field('referrer').value === referrer);
	// 			done();
	// 		});
	// 	});
	// });
	// test('requesting a group rate from the oregon coast tour page should ' + 'populate the hidden referrer field correctly', function(done){
	// 	var referrer = base + '/tours/oregon-coast';
	// 	browser.visit(referrer, function(){
	// 		browser.clickLink('.requestGroupRate', function(){
	// 			assert(browser.field('referrer').value === referrer);
	// 			done();
	// 		});
	// 	});
	// });
	test('visiting the "request group rate" page dirctly should result in an empty value for the referrer field', function(done){
		browser.visit(base + '/tours/request-group-rate', function(){
			browser.assert.element('form input[name=referrer]', '');
			done();
		});
	});
});
