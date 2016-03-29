#!/usr/bin/env node

"use strict";

var _ = require("lodash");

var getCityAirports = function (destinationsRaw) {
  var cityAirports = _.reduce(destinationsRaw, function (result, airlineDestinations, key) {

    var cities = _.reduce(airlineDestinations.destinations, function (result, destination) {
      var cityKey;

      if (destination.airport) {
        cityKey = destination.city.name;
        result[cityKey] = destination.airport.name;
      }
      return result;
    }, {});

    result[key] = cities;
    return result;
  }, []);

  return groupAirports(cityAirports);
};

function groupAirports(cityAirports) {
  var cityObject = {};

  _.map(cityAirports, function (value) {
    _.map(value, function (city, key) {
      if (cityObject[key] !== undefined) {
        if (findCity(cityObject[key], city) === -1) {
          cityObject[key].push(city);
        }
      } else {
        cityObject[key] = [city];
      }
    });
  });
  return cityObject;
}

var generateAirportCity = function (destinationsRaw) {
  var airportKey;
  var airportsCities = _.reduce(destinationsRaw, function (result, value) {
    if (value.destinations) {
      _.map(value.destinations, function (destination) {
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

};

var getAirportRunways = function (airportsRaw) {

  var airportRunways = _.reduce(airportsRaw, function (result, value) {
    var airportKey = getLastUrlPath(value.url);

    var runways = _.reduce(value.data.runway, function (result, value) {
      result.push(value);
      return result;
    }, []);

    if (runways.length) {
      result[airportKey] = runways;
    }
    return result;
  }, {});

  return airportRunways;
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

    airlineData = _.reduce(airlineData, function (result, value, key) {
      if (value !== undefined) {
        result[key] = value;
      }
      return result;
    }, {});

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

function findCity (cityArray, city) {
  return cityArray.findIndex(function (value) {
    return value === city;
  });
}

function cleanUrl(url) {
  return url.replace(/\/wiki\//, "");
}

function getLastUrlPath(url) {
  return url.split("/").pop();
}


module.exports = {
  reduceDestinations: reduceDestinations,
  getIcaoName: getIcaoName,
  reduceAirlines: reduceAirlines,
  reduceAirports: reduceAirports,
  getAirportRunways: getAirportRunways,
  generateAirportCity: generateAirportCity,
  getCityAirports: getCityAirports
};
