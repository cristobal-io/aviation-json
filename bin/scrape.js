#!/usr/bin/env node

"use strict";
var _ = require("lodash");

// bermi: let's get with reduce method, I am using it as a map.
var reduceAirlines = function (airlineDestinations) {
  var airlines = _.reduce(airlineDestinations, function (result, value, key) {
    var destinations = [];

    _.map(value.destinations, function (value) {
      if (value.airport) {
        destinations.push(cleanUrl(value.airport.url));
      }
    });
    var airlineKey = cleanUrl(value.destinationsLink);

    var airline = {};

    airline[airlineKey] = destinations;
    if (airline[airlineKey].length) {
      result[key] = airline;
    }
    return result;
  }, []);

  return airlines.filter(Boolean);
};

var cleanUrl = function(url) {
  return url.replace(/\/wiki\//, "");
};

var reduceAirports = function(airportsRaw) {
  var airports = _.reduce(airportsRaw, function(result, value, key) {
    var airportKey = getLastUrlPath(value.url);
    var airport = {};

    airport[airportKey] = {
      latitude: value.data.coordinates.latitude,
      longitude: value.data.coordinates.longitude,
      name: value.data.name,
      nickname: value.data.nickname,
      iata: value.data.iata,
      icao: value.data.icao
    };
    result[key] = airport;
    return result;
  }, []);

  return airports.filter(Boolean);

  function getLastUrlPath(url) {
    return url.split("/").pop();
  }
};


function getIcaoName(destination, airports) {
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
module.exports.getIcaoName = getIcaoName;
module.exports.reduceAirports = reduceAirports;
