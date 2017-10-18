var _get = require('lodash/get')
var _set = require('lodash/set')
var _isString = require('lodash/isString')
var _isArray = require('lodash/isArray')
var _isObject = require('lodash/isObject')
var _forEach = require('lodash/forEach')
// var Helper = require('./lib/helper')

// TODO: Object.keys shim
module.exports = Mappa


function Mappa(opts) {
	return new Mapper(opts)
}


function Mapper(opts) {
	this.opts = opts
	this.actions = opts.to
	normalize_actions(this.actions)
}


// Action {from[]}

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



function normalize_actions(target_config) {
	_forEach(target_config, function (path_config, path) {
		path_config.from = [].concat(path_config.from)
	})
}
