#!/usr/bin/env node

"use strict";

var _ = require("lodash");

var generateAirportCity = function(destinationsRaw) {
  var airportKey;
  var airportsCities = _.reduce(destinationsRaw, function(result, value) {
    if (value.destinations) {
      _.map(value.destinations, function(destination) {
        if (destination.airport) {
          airportKey = cleanUrl(destination.airport.url);

          result[airportKey] = destination.city;
        }
      });
    }
    return result;
  }, {});

  return airportsCities;
};

var reduceDestinations = function (destinationsRaw) {
  var airlines = _.reduce(destinationsRaw, function (result, value) {
    var destinations = [];

    _.map(value.destinations, function (value) {
      if (value.airport) {
        destinations.push(cleanUrl(value.airport.url));
      }
    });
    var airlineKey = cleanUrl(value.destinationsLink);
    
    if (destinations.length) {
      result[airlineKey] = destinations;
    }
    return result;
  }, {});

  // console.log(airlines);
  return airlines;
};


var reduceAirports = function (airportsRaw) {
  var airports = _.reduce(airportsRaw, function (result, value) {
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

var reduceAirlines = function (airlinesRaw) {
  var airlines = _.reduce(airlinesRaw, function (result, value) {
    var airlineKey = value.name;
    var airlineData = {
      "logoLink": value.logoLink,
      "IATA": value.IATA,
      "ICAO": value.ICAO,
      "Callsign": value.Callsign,
      "hubs": value.hubs,
      "website": value.website
    };

    airlineData = _.reduce(airlineData, function(result, value, key) {
      if (value !== undefined) {
        result[key] = value;
      }
      return result;
    },{});

    result[airlineKey] = airlineData;
    return result;
  }, {});

  return airlines;
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

function cleanUrl (url) {
  return url.replace(/\/wiki\//, "");
}


module.exports = {
  reduceDestinations: reduceDestinations,
  getIcaoName: getIcaoName,
  reduceAirports: reduceAirports,
  reduceAirlines: reduceAirlines,
  generateAirportCity: generateAirportCity
};
