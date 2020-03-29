var express = require('express');
var admin = express.Router();

admin.get('/unauthorized', function(req, res) {
	res.status(403).render('unauthorized');
});

/**
 * Customer Routes
 */

admin.get('/account', utils.authorizedOnly('customer,employee'), function(req, res){
	res.render('account', { username: req.user.name });
});

admin.get('/account/order-history', utils.customerOnly, function(req, res){
	res.render('account/order-history');
});

admin.get('/account/email-prefs', utils.customerOnly, function(req, res){
	res.render('account/email-prefs');
});

/**
 * Employer Routes
 */
admin.get('/sales', utils.employeeOnly, function(req, res){
	res.render('sales');
});

module.exports = admin;
