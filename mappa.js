"use_strict";

var Mapper = require('./lib/mapper')
var MapperRegistry = require('./lib/mapper-registry')

// var Helper = require('./lib/helper')

// TODO: Object.keys shim
module.exports = Mappa


function Mappa(opts) {
	return new Mapper(opts)
}

Mappa.Registry = MapperRegistry
