#!/usr/bin/env node

"use strict";
var _ = require("lodash");

var airports = require("../tmp/airports.json");

var reduceAirlines = function (airlineDestinations) {
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

  return airlines.filter(Boolean);
};

// bermi: this takes really long time.
var airlinesIcao = function(object){
  var airlines = [];

  _.map(object, function (value) {
    var airline = {airline: value.airline, destinations: []};

    _.map(value.destinations, function (destination) {
      var airportIcao = getIcaoName(destination);

      airline.destinations.push(airportIcao);
    });
    airlines.push(airline);
  });
  return airlines;
};

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


module.exports.reduceAirlines = reduceAirlines;
module.exports.airlinesIcao = airlinesIcao;
module.exports.getIcaoName = getIcaoName;
