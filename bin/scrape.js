#!/usr/bin/env node

"use strict";
var _ = require("lodash");

var airlineDestinations = require("../tmp/airline_destinations.json");
// var airports = require("../tmp/airports.json");

var airlines = _.reduce(airlineDestinations, function (result, value, key) {
  var destinations = [];

  _.map(value.destinations, function (value) {
    if (value.airport) {
      destinations.push(value.airport.name);
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

module.exports.airlines = airlines;
