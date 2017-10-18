var _get = require('lodash/get')
var _set = require('lodash/set')
var _isString = require('lodash/isString')
var _isArray = require('lodash/isArray')
var _isObject = require('lodash/isObject')
var _forEach = require('lodash/forEach')
var _intersection = require('lodash/intersection')
// var Helper = require('./lib/helper')

// TODO: Object.keys shim
module.exports = Mappa


function Mappa(opts) {
	return new Mapper(opts)
}


function Mapper(opts) {
	this.opts = opts
	this.actions = normalize_actions(opts.to)
}


Mapper.prototype.read = function (source) {
	if (!_isObject(source) || _isArray(source)) return

	var target = {}

	_forEach(this.actions, function (action, path) {

		var values = action.from.map(function (p){
			return _get(source, p)
		})

		_set(target, path, action.read.apply(null, values))
	})

	return target
}


Mapper.prototype.write = function (target) {
	if (!_isObject(target) || _isArray(target)) return

	var source = {}

	_forEach(this.actions, function (action, path) {
		var values = action.write(_get(target, path))

		action.from.forEach(function (source_path, i) {
			_set(source, source_path, values[i])
		})
	})

	return source
};


Mapper.prototype.sources = function(picked_paths){
	var self = this
	var path_list = Object.keys(self.actions)
	if (picked_paths) path_list = _intersection(path_list, picked_paths)
	return path_list.reduce(function(result, path) {
		return result.concat(self.actions[path].from)
	}, [])
};



function normalize_actions(target_config) {
	var path

	for (path in target_config) {
		target_config[path] = PathConfig(target_config[path])
	}

	return target_config
}



function PathConfig(config) {
	if (_isString(config) || _isArray(config)) {
		config = {from: config}
	}

	config.from = [].concat(config.from)
	config.read = config.read || pass_thru
	config.write = config.write || pass_thru

	return config
}



function pass_thru(value) { return value }
