"use_strict";

var Mapper = require('./mapper')

module.exports = MapperRegistry

function MapperRegistry() {
	var mappers = {}

	return {
		get: get,
		use: use,
		define: define
	}


	function get(name) {
		var mapper = mappers[name]
		if (!mapper) throw new Error('No mapper defined for: ' + name)
		return mapper
	}


	function use(name, opts) {
		return Object.assign({
			mapper: function () {
				return get(name)
			},
			read: function (value) {
				return get(name).read(value, {as_main_source: true})
			},

			write: function (value) {
				return get(name).write(value, {as_main_source: true})
			}
		}, opts)
	}


	function define(name, opts) {
		mappers[name] = new Mapper(opts)
	}
}
