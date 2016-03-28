var _get = require('lodash/get')
var _set = require('lodash/set')
var _isString = require('lodash/isString')
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




	function read(source) {
		var obj = {}
		read_ops.forEach(function (op) {
			op(source, obj)
		})
		return obj
	}


	function write(obj) {
		var source = {}
		write_ops.forEach(function (op) {
			op(obj, source)
		})
		return source
	}


	// private


	function init(config) {
		for (var key in config) {
			var path_config = PathConfig(key, config[key])
			read_ops.push(ReadOp(key, path_config))
			write_ops.push(WriteOp(key, path_config))
		}
	}
}


function PathConfig(key, config) {
	if (_isString(config)) {
		if (config === '=') config = key
		return Helper.key(config)
	}

	return config
}


function ReadOp(key, path_config) {
	return function (source, obj) {
		_set(obj, key, path_config._read(source))
	}
}



function WriteOp(key, path_config) {
	return function (obj, source) {
		path_config._write(_get(obj, key), source)
	}
}


Mappa.helper = Helper
