var CustomerModel = require('../models/customer.js');
var CustomerViewModel = require('../viewModels/customer.js');

module.exports = {
  registerRoutes: function(app) {
    app.get('/customer/register', this.registerHTML);
    app.post('/customer/register', this.registerProccess);
    app.get('/customer/:id', this.home);
  },
  registerHTML: function(req, res, next) {
    res.render('customer/register');
  },
  registerProccess: function(req, res, next) {
    var c = new CustomerModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      phone: req.body.phone,
    });
    c.save(function(err) {
      if (err) return next(err);
      res.redirect(303, '/customer/' + c._id);
    });
  },
  home: function(req, res, next) {
    CustomerModel.findById(req.params.id, function(err, customer) {
      if (err) return next(err);
      if (!customer) return next(); // pass this on to 404 handler
      res.render('customer/home', CustomerViewModel(customer));
    });
  },
};
