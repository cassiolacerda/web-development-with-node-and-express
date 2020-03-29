/**
 * Private Libs
 */

/**
 * Private Models
 */
var Vacation = reqlib('/models/vacation.js');
var VacationInSeasonListener = reqlib('/models/vacationInSeasonListener.js');

/**
 * Handlers
 */

/**
 * Create
 */
module.exports.create = function(req, res) {
  Vacation.find(function(err, vacations) {
    if (vacations.length) return;

    new Vacation({
      name: 'Hood River Day Trip',
      slug: 'hood-river-day-trip',
      category: 'Day Trip',
      sku: 'HR199',
      description: 'Spend a day sailing on the Columbia and enjoying craft beers in Hood River!',
      priceInCents: 9995,
      tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
      inSeason: true,
      maximumGuests: 16,
      available: true,
      packagesSold: 0,
    }).save();

    new Vacation({
      name: 'Oregon Coast Getaway',
      slug: 'oregon-coast-getaway',
      category: 'Weekend Getaway',
      sku: 'OC39',
      description: 'Enjoy the ocean air and quaint coastal towns!',
      priceInCents: 269995,
      tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
      inSeason: false,
      maximumGuests: 8,
      available: true,
      packagesSold: 0,
    }).save();

    new Vacation({
      name: 'Rock Climbing in Bend',
      slug: 'rock-climbing-in-bend',
      category: 'Adventure',
      sku: 'B99',
      description: 'Experience the thrill of rock climbing in the high desert.',
      priceInCents: 289995,
      tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing', 'hiking', 'skiing'],
      inSeason: true,
      requiresWaiver: true,
      maximumGuests: 4,
      available: false,
      packagesSold: 0,
      notes: 'The tour guide is currently recovering from a skiing accident.',
    }).save();
  });
  res.send('');
};

/**
 * List
 */
module.exports.list = function(req, res) {
  Vacation.find({
    available: true
  }, function(err, vacations) {
    var currency = req.session.currency || 'USD';
    var context = {
      currency: currency,
      vacations: vacations.map(function(vacation) {
        return {
          sku: vacation.sku,
          name: vacation.name,
          slug: vacation.slug,
          description: vacation.description,
          inSeason: vacation.inSeason,
          price: '$' + utils.convertFromUSD(vacation.priceInCents / 100, currency).toFixed(2),
          qty: vacation.qty,
        };
      })
    };
    switch (currency) {
      case 'USD':
        context.currencyUSD = 'active';
        break;
      case 'GBP':
        context.currencyGBP = 'active';
        break;
      case 'BTC':
        context.currencyBTC = 'active';
        break;
    }
    res.render('vacations', context);
  });
};

/**
 * Product Item
 */
module.exports.product = function(req, res, next) {
  Vacation.findOne({
    slug: req.params.vacation
  }, function(err, vacation) {
    if (err) return next(err);
    if (!vacation) return next();
    res.render('vacation', {
      vacation: {
        sku: vacation.sku,
        name: vacation.name
      }
    });
  });
};

/**
 * Notify
 */
module.exports.notifyHTML = function(req, res) {
  res.render('notify-me-when-in-season', {
    sku: req.query.sku
  });
};

module.exports.notifySave = function(req, res) {
  VacationInSeasonListener.update({
      email: req.body.email
    }, {
      $push: {
        skus: req.body.sku
      }
    }, {
      upsert: true
    },
    function(err) {
      if (err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'There was an error processing your request.',
        };
        return res.redirect(303, '/vacations');
      }
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'You will be notified when this vacation is in season.',
      };
      return res.redirect(303, '/vacations');
    }
  );
};

/**
 * Session
 */
module.exports.session = function(req, res) {
  req.session.currency = req.params.currency;
  return res.redirect(303, '/vacations');
};
