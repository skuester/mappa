"use_strict";

var _get = require('lodash/get')
var _set = require('lodash/set')
var _isString = require('lodash/isString')
var _isArray = require('lodash/isArray')
var _isObject = require('lodash/isObject')
var _forEach = require('lodash/forEach')
var _intersection = require('lodash/intersection')
var _pick = require('lodash/pick')
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

		var read_value = action.read.apply(null, values)
		if (typeof read_value !== 'undefined') {
			_set(target, path, read_value)
		}
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

	var actions = picked_paths ?
		_pick(this.actions, picked_paths) :
		this.actions

	var out = [], key
	for (key in actions) {
		out = out.concat(actions[key].from)
	}
	return out
};



Mapper.prototype.source_tree = function(picked_paths){
	var source_list = this.sources(picked_paths)

	var virtual_source = {}

	source_list.forEach(path => {
		_set(virtual_source, path, true)
	})

	return get_source_tree_for_node(virtual_source)
};


function get_source_tree_for_node(node, output) {
	var output = {}

	_forEach(node, function (value, key) {
		if (value === true) {
			output.fields = output.fields || []
			output.fields.push(key)
		}
		else {
			output.from = output.from || {}
			output.from[key] = get_source_tree_for_node(node[key])
		}
	})

	return output
}



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
