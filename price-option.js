var debug = require('debug')('server:options');

function BlackScholes(PutCallFlag, S, X, T, r, v) {

  var d1, d2;
  d1 = (Math.log(S / X) + (r + v * v / 2.0) * T) / (v * Math.sqrt(T));
  d2 = d1 - v * Math.sqrt(T);

  if (PutCallFlag== "c")
    return S * CND(d1)-X * Math.exp(-r * T) * CND(d2);
  else
    return X * Math.exp(-r * T) * CND(-d2) - S * CND(-d1);
}

/* The cummulative Normal distribution function: */
function CND(x) {

  var a1, a2, a3, a4 ,a5, k ;

  a1 = 0.31938153, a2 =-0.356563782, a3 = 1.781477937, a4= -1.821255978 , a5= 1.330274429;

  if (x < 0.0)
    return 1 - CND(-x);
  else
    k = 1.0 / (1.0 + 0.2316419 * x);

  return 1.0 - Math.exp(-x * x / 2.0)/ Math.sqrt(2*Math.PI) * k
  * (a1 + k * (-0.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429)))) ;
}

// var rate = 1.1100;
// var strike = 1.4000;

// var notional = 1000000;

//var result = BlackScholes('c', notional * rate, notional * strike, 1, 0.05, 0.2);

module.exports = function(app) {
  app.post('/options/price', function(req, res) {

    debug('/options/price - entry()', req.body);

    var option = req.body;

    // todo: for now just price the first leg
    var leg = option.legs[0];
    var callPut = leg.type == 'call' ? 'c' : 'p';
    var strike = leg.strike;
    var rate = 1.234; // todo: get live rate

    var priceNow = leg.notional * rate;
    var futurePrice = leg.notional * leg.strike;
    var time = 1; // todo: this is time as expressed in terms of one year
    var riskFreeRate = 0.05; // todo: source this from somewhere

    var sigma = 0.2; // made up

    debug('params', callPut, priceNow, futurePrice, time, riskFreeRate, sigma);

    var price = BlackScholes(callPut, priceNow, futurePrice, time, riskFreeRate, sigma);

    option.price = price;

    debug('price is: ', price);

    return res.send(option).end();
  });
}