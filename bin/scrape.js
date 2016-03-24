#!/usr/bin/env node

"use strict";
var _ = require("lodash");

var reduceDestinations = function (airlineDestinations) {
  var airlines = _.reduce(airlineDestinations, function (result, value) {
    var destinations = [];

    _.map(value.destinations, function (value) {
      if (value.airport) {
        destinations.push(cleanUrl(value.airport.url));
      }
    });
    var airlineKey = cleanUrl(value.destinationsLink);

    if (destinations) {
      result[airlineKey] = destinations;
    }
    return result;
  }, {});

  return airlines;
};

var cleanUrl = function(url) {
  return url.replace(/\/wiki\//, "");
};

var reduceAirports = function(airportsRaw) {
  var airports = _.reduce(airportsRaw, function(result, value) {
    var airportKey = getLastUrlPath(value.url);
    var airport = {
      latitude: value.data.coordinates.latitude,
      longitude: value.data.coordinates.longitude,
      name: value.data.name,
      nickname: value.data.nickname,
      iata: value.data.iata,
      icao: value.data.icao
    };

    result[airportKey] = airport;
    return result;
  }, {});

  return airports;

  function getLastUrlPath(url) {
    return url.split("/").pop();
  }
};

var reduceAirlines = function(airlinesRaw) {
  var airlines = _.reduce(airlinesRaw, function(result, value, key) {
    
  }, {});
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


module.exports = {
  reduceDestinations : reduceDestinations,
  getIcaoName : getIcaoName,
  reduceAirports : reduceAirports,
  reduceAirlines : reduceAirlines
};
