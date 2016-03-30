SHELL = /bin/bash
MAKEFLAGS += --no-print-directory --silent
export PATH := ./node_modules/.bin:$(PATH):./bin
LINT_DIR = $(wildcard bin/* *.js src/*.js test/*.js scrapers/*.js spikes/*.js test/*/*.js scrapers/*/*.js spikes/*/*.js)

default: setup test

setup:
	npm install

# lint
lint:
	echo "Linting started..."
	eslint $(LINT_DIR)
	echo "Linting finished without errors"

test: lint
	mocha test

dev:
	mocha test -w

test-coverage-report:
	echo "Generating coverage report, please stand by"
	test -d node_modules/nyc/ || npm install nyc
	nyc mocha && nyc report --reporter=html
	open coverage/index.html

aviation-json:
	aviation-json destinations
	aviation-json airports
	aviation-json airlines
	aviation-json cities
	aviation-json runways
	aviation-json airport_airlines

sync: aviation-scrapper aviation-json

aviation-scrapper:
	aviation-scrapper -d
	aviation-scrapper -l
	aviation-scrapper -c
	aviation-scrapper -a

.PHONY: test