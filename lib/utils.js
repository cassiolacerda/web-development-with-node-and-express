module.exports = {
  convertFromUSD: function(value, currency) {
    switch (currency) {
      case 'USD':
        return value * 1;
      case 'GBP':
        return value * 0.6;
      case 'BTC':
        return value * 0.0023707918444761;
      default:
        return NaN;
    }
    next();
  },
  customerOnly: function(req, res, next){
  	if(req.user && req.user.role==='customer') return next();
  	res.redirect(303, '/unauthorized');
  },
  employeeOnly: function(req, res, next){
  	if(req.user && req.user.role==='employee') return next();
  	res.redirect(303, '/unauthorized');
  },
  authorizedOnly: function(roles) {
  	return function(req, res, next) {
  		if(req.user && roles.split(',').indexOf(req.user.role)!==-1) return next();
  		res.redirect(303, '/unauthorized');
  	};
  },
};
