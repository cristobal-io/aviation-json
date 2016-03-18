"use strict";
var assert = require("chai").assert;
var Ajv = require("ajv");
var ajv = Ajv();
var _ = require("lodash");

var scrapeJs = require("../bin/scrape.js");
var airlines = scrapeJs.airlines;
var airlinesIcao = scrapeJs.airlinesIcao;
var airlinesSchema = require("../schema/airlines_names.schema.json");

describe("bin/scrape.js tests", function() {
  it("should return an array", function () {
    assert.typeOf(airlines, "array");
  });

  it("should meet the basic schema", function () {
    var validateAirlineSchema = ajv.compile(airlinesSchema);
    var validAirlineSchema = validateAirlineSchema(airlines);

    assert.isTrue(validAirlineSchema, _.get(validateAirlineSchema, "errors[0].message"));
  });

  it("should subsitute the destinations with the respective ICAO code", function () {
    assert.typeOf(airlinesIcao, "array");
  });
});
