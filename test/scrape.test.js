"use strict";
var assert = require("chai").assert;
var Ajv = require("ajv");
var ajv = Ajv();
var _ = require("lodash");

var scrapeJs = require("../bin/scrape.js");
var airlines = scrapeJs.airlines;
var airlinesIcao = scrapeJs.airlinesIcao;
var getIcaoName = scrapeJs.getIcaoName;

var airlinesSchema = require("../schema/airlines_names.schema.json");

describe("bin/scrape.js tests", function() {
  describe("airlines:", function() {
    
    it("should return an array", function () {
      assert.typeOf(airlines, "array");
    });

    it("should meet the basic schema", function () {
      var validateAirlineSchema = ajv.compile(airlinesSchema);
      var validAirlineSchema = validateAirlineSchema(airlines);

      assert.isTrue(validAirlineSchema, _.get(validateAirlineSchema, "errors[0].message"));
    });
  });
  describe("switch airport name for ICAO name", function() {
    
    it("should subsitute the destinations with the respective ICAO code", function () {
      assert.typeOf(airlinesIcao, "function");
    });
  });

  describe("getIcaoName fn", function() {
    it("should be a function", function() {
      assert.typeOf(getIcaoName, "function");
    });
  });
});
