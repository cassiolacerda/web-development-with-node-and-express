function smartJoin(arr, separator) {
  if (!separator) separator = ' ';
  return arr.filter(function(elt) {
    return elt !== undefined &&
      elt !== null &&
      elt.toString().trim() !== '';
  }).join(separator);
}

var _ = require('underscore');

function getCustomerViewModel(customer) {
  var vm = _.omit(customer, 'salesNotes');
  return _.extend(vm, {
    name: smartJoin([customer.firstName, customer.lastName]),
    fullAddress: smartJoin([
      customer.address1,
      customer.address2,
      customer.city + ', ' +
      customer.state + ' ' +
      customer.zip,
    ], '<br>')
  });
}

module.exports = getCustomerViewModel;
