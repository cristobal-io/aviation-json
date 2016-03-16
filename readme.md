# aviation-data-json

would be a module that uses aviation-data-scrapper as a dev dependency to generate using a single command the following JSON files:

* airports.json (an array with all the airport data)
* airlines.json (an array with all the airlines data)
* cities.json (an array with all the cities)
* airport_cities.json (an object where the key is the primary key of the city and the value is an array of airport codes)
* airline_destinations.json (an object where the key is the airline code and an array of destination airport codes)