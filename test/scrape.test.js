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

var airlinesSchema = require("../schema/airlines_names.schema.json");
var airlineDestinations = require("../tmp/airline_destinations.json");
var airportsRaw = require("../tmp/airports.json");
var airlinesRaw = require("../tmp/airlines_data.json");


describe("bin/scrape.js tests", function () {
  describe("destinations:", function () {
    var airlines;

    before(function () {
      airlines = reduceDestinations(airlineDestinations);
    });

    it("should be a function", function () {
      assert(typeof reduceDestinations === "function", "not a function!");
    });

    it("shouldn't have empty destinations or wiki urls", function () {
      _.map(airlines, function (airline) {
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
      var validateAirlineSchema = ajv.compile(airlinesSchema);
      var validAirlineSchema = validateAirlineSchema(airlines);

      assert(validAirlineSchema, _.get(validateAirlineSchema, "errors[0].message"));
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
        

        assert(validAirport, JSON.stringify(validateAirport,null,2));
        // assert(airport.latitude, "doesn't have latitude ");
        // assert(airport.longitude, "doesn't have longitude");
        // assert(airport.name, "doesn't have name");
        // assert(airport.nickname, "doesn't have nickname");
        // assert(airport.iata, "doesn't have iata");
        // assert(airport.icao, "doesn't have icao");
      });
    });
  });

  describe("reduceAirlines fn", function() {
    var airlines;

    before(function () {
      airlines = reduceAirlines(airlinesRaw);
    });
    it("should have all a name so we can use it as a primary key", function () {

      _.map(airlinesRaw, function(airline) {
        assert.ok(airline.name, "doesn't has name" + airline.name);
      });
    });

    it("should be a fn", function () {
      assert.ok(typeof reduceAirlines === "function", "it is " + typeof reduceAirlines);
    });

    it("should meet the airline data schema", function () {
      assert.ok(airlines, "airlines it's empty");
      _.map(airlines, function(airline) {
        var airlinesSchema = require("../schema/airlines.schema.json");
        var validateAirlineSchema = ajv.compile(airlinesSchema);
        var validAirline = validateAirlineSchema(airline);

        assert.ok(validAirline, validateAirlineSchema);
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
