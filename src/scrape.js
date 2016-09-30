#!/usr/bin/env node

"use strict";

var _ = require("lodash");

var getAirportAirlines = function (destinationsRaw) {
  var airportAirlines = _.reduce(destinationsRaw, function (result, value) {
    var airlineName = value.name;

    value.destinations.map(function (destination) {

      if (destination.airport === undefined) {
        return;
      }
      var airportName = cleanUrl(destination.airport.url);

      if (result[airportName] !== undefined) {
        if (hasDuplicates(result[airportName], airlineName) === -1) {
          result[airportName].push(airlineName);
        }
      } else {
        result[airportName] = [airlineName];
      }
    });
    return result;
  }, {});

  return airportAirlines;
};

var getCityAirports = function (destinationsRaw) {
  var cityAirports = _.reduce(destinationsRaw, function (result, airlineDestinations, key) {

    var cities = _.reduce(airlineDestinations.destinations, function (result, destination) {
      var cityKey;

      if (destination.airport) {
        if (destination.airport.url && destination.city.url) {
          cityKey = cleanUrl(destination.city.url);
          result[cityKey] = cleanUrl(destination.airport.url);
        }
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
        if (hasDuplicates(cityObject[key], city) === -1) {
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
  var cityUrl;
  var airportsCities = _.reduce(destinationsRaw, function (result, value) {
    if (value.destinations) {
      _.map(value.destinations, function (destination) {
        if (destination.airport) {
          airportKey = cleanUrl(destination.airport.url);

          if (destination.city.url) {
            cityUrl = cleanUrl(destination.city.url) || "";
          }

          result[airportKey] = {
            name: destination.city.name,
            url: cityUrl
          };
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

function getDDCoordinates(coordinates) {
  coordinates = coordinates.split(/°|′|″/);
  var degrees = coordinates[0];
  var minutes = coordinates[1];
  var seconds, direction;

  if (coordinates.length < 4) {
    seconds = null;
    direction = coordinates[2];
  } else {
    seconds = coordinates[2];
    direction = coordinates[3];
  }

  return convertDMSToDD(+degrees, +minutes, +seconds, direction);
}

function convertDMSToDD(degrees, minutes, seconds, direction) {
  var dd = degrees + minutes / 60 + seconds / (60 * 60);

  if (direction == "S" || direction == "W") {
    dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
}


var reduceAirports = function (airportsRaw) {
  var airports = _.reduce(airportsRaw, function (result, value) {
    var airportKey = getLastUrlPath(value.url);
    var airport = {
      latitude: value.data.coordinates.latitude,
      longitude: value.data.coordinates.longitude,
      name: value.data.name,
      nickname: value.data.nickname,
      iata: value.data.iata,
      icao: value.data.icao,
      dd_latitude: getDDCoordinates(value.data.coordinates.latitude),
      dd_longitude: getDDCoordinates(value.data.coordinates.longitude)
    };

    result[airportKey] = airport;
    return result;
  }, {});

  return airports;

};

var setAirportAirlinesNumber = function(airports, airportAirlines) {
  return _.forEach(airports,function(value, key) {
    var airportAirline = airportAirlines[key];
    
    if (airportAirline !== undefined) {
      value["airlinesFlying"] = airportAirline.length;
    }

    return value;
  } );
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

    var hubs = _.map(value.hubs, function (hub) {
      var link = cleanUrl(hub.link);

      return {
        name: hub.name,
        link: link
      };
    });

    var airlineKey = cleanUrl(value.url);
    var airlineData = {
      "name": value.name,
      "logoLink": value.logoLink,
      "IATA": value.IATA,
      "ICAO": value.ICAO,
      "Callsign": value.Callsign,
      "hubs": hubs,
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

function hasDuplicates(cityArray, city) {
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
  getCityAirports: getCityAirports,
  getAirportAirlines: getAirportAirlines,
  getDDCoordinates: getDDCoordinates,
  setAirportAirlinesNumber: setAirportAirlinesNumber
};
