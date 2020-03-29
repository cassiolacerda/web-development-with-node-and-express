var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  zip: String,
  phone: String,
  salesNotes: [{
    date: Date,
    salespersonId: Number,
    notes: String,
  }],
});

var Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
