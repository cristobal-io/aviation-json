"use strict";
var assert = require("assert");
var Ajv = require("ajv");
var ajv = Ajv();
var _ = require("lodash");

var scrapeJs = require("../bin/scrape.js");
var reduceAirlines = scrapeJs.reduceAirlines;
var changeUrltoIcao = scrapeJs.changeUrltoIcao;
var getIcaoName = scrapeJs.getIcaoName;

var airlinesSchema = require("../schema/airlines_names.schema.json");
var airlineDestinations = require("../tmp/airline_destinations.json");


describe("bin/scrape.js tests", function () {
  describe("airlines:", function () {
    var airlines;

    before(function () {
      airlines = reduceAirlines(airlineDestinations);
    });

    it("should be a function", function () {
      assert(typeof reduceAirlines === "function", "not a function!");
    });

    it("shouldn't have empty destinations or wiki urls", function () {
      _.map(airlines,function(airline) {
        assert(!(/\/wiki\//.test(Object.keys(airline))), "the key url contains wiki.");
        // console.log(Object.keys(airline));
        _.map(airline, function(destinations) {
          assert(destinations.length > 0, "there are empty destinations");
          _.map(destinations, function(destination) {
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
  
  describe("switch airport name for ICAO name", function () {

    it("should subsitute the destinations with the respective ICAO code", function () {
      assert(typeof changeUrltoIcao === "function");
    });

    it("should change the values using changeUrltoIcao fn", function () {
      var airlinesToIcao = require("../test/fixtures/airlines_to_get_icao.json");
      var expectedAirlinesIcao = require("./fixtures/expected_airlines_icao.json");
      var changedIcaoAirlines = changeUrltoIcao(airlinesToIcao);

      assert.deepEqual(changedIcaoAirlines, expectedAirlinesIcao);
    });
  });

  describe("getIcaoName fn", function () {
    it("should be a function", function () {
      assert(typeof getIcaoName === "function");
    });

    it("should return the ICAO name", function () {
      var icaoAirport = getIcaoName("/wiki/Amsterdam_Airport_Schiphol");
      var expectedIcao = "EHAM";

      assert.equal(icaoAirport, expectedIcao, "the url is not being find.");
    });
  });
});
