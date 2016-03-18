#!/usr/bin/env node

"use strict";
var _ = require("lodash");

var airlineDestinations = require("../tmp/airline_destinations.json");
var airports = require("../tmp/airports.json");

var airlines = _.reduce(airlineDestinations, function (result, value, key) {
  var destinations = [];

  _.map(value.destinations, function (value) {
    if (value.airport) {
      destinations.push(value.airport.url);
    }
  });

  var airline = {
    airline: value.name,
    destinations: destinations
  };

  if (airline.destinations.length) {
    result[key] = airline;
  }

  return result;
}, []);

airlines = airlines.filter(Boolean);


// todo: this takes really long time. need to fix it, at least for testing purposes.
var airlinesIcao = _.map(airlines, function (value) {
  _.map(value.destinations, function (destination) {
    var airportIcao = getIcaoName(destination);

    return airportIcao;
  });

});

function getIcaoName(destination) {
  var airport = _.find(airports, function (o) {
      var regDest = new RegExp(destination);

      return regDest.test(o.url);
    }),
    icaoAirport;

  if (airport) {
    icaoAirport = airport.data.icao;
  } else {
    icaoAirport = destination;
  }
  return icaoAirport;
}


module.exports.airlines = airlines;
module.exports.airlinesIcao = airlinesIcao;
