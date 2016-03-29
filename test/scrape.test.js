"use strict";
var assert = require("assert");
var Ajv = require("ajv");
var ajv = Ajv();
var _ = require("lodash");

var scrapeJs = require("../bin/scrape.js");
var reduceDestinations = scrapeJs.reduceDestinations;
var getIcaoName = scrapeJs.getIcaoName;
var reduceAirports = scrapeJs.reduceAirports;
var reduceAirlines = scrapeJs.reduceAirlines;
var generateAirportCity = scrapeJs.generateAirportCity;
var getAirportRunways = scrapeJs.getAirportRunways;
var getCityAirports = scrapeJs.getCityAirports;
var getAirportAirlines = scrapeJs.getAirportAirlines;

var destinationsSchema = require("../schema/destinations.schema.json");

var destinationsRaw = require("../tmp/airline_destinations.json");
var airportsRaw = require("../tmp/airports.json");
var airlinesRaw = require("../tmp/airlines_data.json");


describe("bin/scrape.js tests", function () {

  describe("getAirportAirlines fn", function() {
    it("should be a function", function() {
      assert.ok(typeof getAirportAirlines === "function", "it's not a function");
    });

    it("should return an object", function() {
      var objectSchema = {
        "type": "object",
        "minProperties": 1
      };

      var airportAirlines = getAirportAirlines(destinationsRaw);
      var validateAirportAirlinesSchema = ajv.compile(objectSchema);
      var validAirportAirlines = validateAirportAirlinesSchema(airportAirlines);

      // var fs = require("fs");
  
      // fs.writeFile("./tmp.json", JSON.stringify(airportAirlines,null,2));

      // console.log(airportAirlines);
      assert.ok(validAirportAirlines, "doesn't meet the proper schema: " + 
          _.get(validateAirportAirlinesSchema, "errors[0].message")
        );
      // _.map(airportAirlines, function(airport) {
        // console.log(airport);
      // });

    });
  });
  it("has to detect duplicates", function() {
    var arrayDuplicates = ["hi","hello","bye", "hi"];
    var arrayWithoutDuplicates = ["hi","hello","bye"];

    assert.ok(detectDuplicatesInArray(arrayDuplicates), "it is not detecting the duplicated values");
    assert.ok(!detectDuplicatesInArray(arrayWithoutDuplicates), "it is giving false positive");
  });
  function detectDuplicatesInArray(collection) {
    var duplicatesFound= false;

    _.map(collection, function(value, index, col) {
      if (duplicatesFound) {return;}
      col.splice(index,index+1);
      duplicatesFound = _.includes(col, value);
    });
    return duplicatesFound;
  }
  // detectDuplicatesInArray(["hi","hello","bye", "hi"]);
  describe("getCityAirports fn", function () {
    it("all the destinations must have a name on city field", function () {

      _.map(destinationsRaw, function (airlineDestinations) {
        _.map(airlineDestinations.destinations, function (destination) {
          assert.ok(destination.city.name, "doesn't have a name for the city" + destination.city.name);
        });
      });
    });

    it("should be a fn", function () {
      assert.ok(typeof getCityAirports === "function", "this is not a function");
    });

    it("should return a correct object", function () {
      var cityAirports = getCityAirports(destinationsRaw);

      var arraySchema = {
        "type": "array",
        "minItems": 1
      };
      var validateAirportSchema = ajv.compile(arraySchema);
      var findCity = function (cityArray, city) {
        return cityArray.findIndex(function (value) {
          return value === city;
        });
      };

      assert.ok(cityAirports, "the object is empty.");
      _.map(cityAirports, function (airport) {
        var validAirportSchema = validateAirportSchema(airport);

        assert.ok(validAirportSchema, "the airport doesn't meet the schema: " +
          _.get(validateAirportSchema, "errors[0].message"));
        airport.map(function(value, index, collection) {
          collection.splice(index,1);
          assert.ok(findCity(collection,value) === -1, "there are duplicated airports");
        });
      });
    });
  });


  describe("generateAirportCity fn", function () {
    it("should meet the schema", function () {
      var airportsCities = generateAirportCity(destinationsRaw);

      assert.ok(airportsCities, "the airportsCities is empty");
      _.map(airportsCities, function (airport) {
        assert.ok(airport, "there is an airport without city");
        assert.ok(airport.name, "there is no name");
      });
    });
  });


  describe("reduceDestinations fn:", function () {
    var destinations;

    before(function () {
      destinations = reduceDestinations(destinationsRaw);
    });

    it("should be a function", function () {
      assert(typeof reduceDestinations === "function", "not a function!");
    });

    it("shouldn't have empty destinations or wiki urls", function () {
      _.map(destinations, function (airline) {
        assert(!(/\/wiki\//.test(Object.keys(airline))), "the key url contains wiki.");
        _.map(airline, function (destinations) {
          assert(destinations.length > 0, "there are empty destinations");
          _.map(destinations, function (destination) {
            assert(!(/\/wiki\//.test(destination)), "the destination url contains wiki.");
          });

        });
      });
    });

    it("should meet the basic schema", function () {
      var validateDestinationsSchema = ajv.compile(destinationsSchema);
      var validDestination = validateDestinationsSchema(destinations);

      assert(validDestination, _.get(validateDestinationsSchema, "errors[0].message"));
    });
  });


  describe("reduceAirports fn", function () {

    it("should meet the schema", function () {

      var airports = reduceAirports(airportsRaw);
      var airportSchema = require("../schema/airport.schema.json");

      assert(airports, "airports doesn't exist");

      _.map(airports, function (airport) {
        var validateAirport = ajv.compile(airportSchema);
        var validAirport = validateAirport(airport);


        assert(validAirport, JSON.stringify(validateAirport, null, 2));
      });
    });
  });


  describe("getAirportRunways fn", function () {
    it("should be a fn", function () {
      assert.ok(typeof getAirportRunways === "function", "this is not a fn");
    });

    it("should return an object", function () {
      var airportRunways = getAirportRunways(airportsRaw);

      assert.ok(airportRunways, "it doesn't return an object");
      _.map(airportRunways, function (runway) {
        assert.ok(runway.length > 0, "there are no runway");
      });
    });
  });

  describe("reduceAirlines fn", function () {
    var airlines;

    before(function () {
      airlines = reduceAirlines(airlinesRaw);
    });
    it("should have all a name so we can use it as a primary key", function () {

      _.map(airlinesRaw, function (airline) {
        assert.ok(airline.name, "doesn't has name" + airline.name);
      });
    });

    it("should be a fn", function () {
      assert.ok(typeof reduceAirlines === "function", "it is " + typeof reduceAirlines);
    });

    it("should meet the airline data schema", function () {
      assert.ok(airlines, "airlines it's empty");
      _.map(airlines, function (airline) {
        var airlinesSchema = require("../schema/airlines.schema.json");
        var validateAirlineSchema = ajv.compile(airlinesSchema);
        var validAirline = validateAirlineSchema(airline);

        assert.ok(validAirline, _.get(validateAirlineSchema, "errors[0].message"));
        _.map(airline, function (value) {
          assert.ok(value, "no empty values on airlines");
        });
      });
    });
  });


  describe("getIcaoName fn", function () {
    it("should be a function", function () {
      assert(typeof getIcaoName === "function");
    });

    it("should return the ICAO name", function () {
      var icaoAirport = getIcaoName("/wiki/Amsterdam_Airport_Schiphol", airportsRaw);
      var expectedIcao = "EHAM";

      assert.equal(icaoAirport, expectedIcao, "the url is not being find.");
    });
  });

});
