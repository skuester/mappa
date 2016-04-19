var _get = require('lodash/get')
var _set = require('lodash/set')
var _isString = require('lodash/isString')
var _isArray = require('lodash/isArray')
var Helper = require('./lib/helper')

// TODO: Object.keys shim
module.exports = Mappa


function Mappa(config) {
	var read_ops = []
	var write_ops = []

	init(config)

	return {
		read: read,
		write: write
	}


	function read(source, opts) {
		opts = opts || {}

		var obj = opts.to || {}
		read_ops.forEach(function (op) {
			op(source, obj)
		})
		return obj
	}


	function write(obj, opts) {
		opts = opts || {}

		var source = opts.to || {}
		write_ops.forEach(function (op) {
			op(obj, source)
		})
		return source
	}


	// private


	function init(config) {
		MapperConfig(config).forEach(function (block) {
			for (var key in block._map) {
				var path_config = PathConfig(key, block._map[key])
				read_ops.push(ReadOp(key, path_config))
				write_ops.push(WriteOp(key, path_config))
			}
		})
	}
}
Mappa.helper = Helper



function MapperConfig(config) {
	if (!_isArray(config)) config = [BlockConfig(config)]
	return config
}


function BlockConfig(config) {
	if (!config._map) {
		config = {_map: config}
	}

	return config
}


function PathConfig(key, config) {
	if (_isString(config)) {
		if (config === '=') config = key
		config = Helper.key(config)
	}
	else if (_isArray(config)) {
		config = Helper.array(config[0], Mappa(config[1]))
	}
	else if (!(config._read || config._write)) {
		config = Helper.mapper(Mappa(config))
	}

	default_to_constant_fn(config, '_read_if', true)
	default_to_constant_fn(config, '_write_if', true)
	return config
}


function ReadOp(key, path_config) {
	return function (source, obj) {
		if (!path_config._read_if(source)) return
		_set(obj, key, path_config._read(source))
	}
}


function WriteOp(key, path_config) {
	return function (obj, source) {
		var value = _get(obj, key)
		if (!path_config._write_if(value, source)) return
		path_config._write(value, source)
	}
}


// MUTATES the obj
// if the key is not a function, create one which returns the given return_value
function default_to_constant_fn(obj, key, return_value) {
	if (!(typeof obj[key] == 'function')) {
		obj[key] = function () { return return_value }
	}
}
