"use_strict";

var _get = require('lodash/get')
var _set = require('lodash/set')
var _isString = require('lodash/isString')
var _isArray = require('lodash/isArray')
var _isObject = require('lodash/isObject')
var _intersection = require('lodash/intersection')
var _pick = require('lodash/pick')
var _uniq = require('lodash/uniq')
// var Helper = require('./lib/helper')

// TODO: Object.keys shim
module.exports = Mappa


function Mappa(opts) {
	return new Mapper(opts)
}

Mappa.Registry = Registry

function Mapper(opts) {
	this.opts = opts
	this.main_source_path = opts.from
	this.actions = normalize_actions(opts.to, this.main_source_path)
}


Mapper.prototype.read = function (source, opts) {
	if (!_isObject(source) || _isArray(source)) return

	if (opts && opts.as_main_source && this.main_source_path) {
		source = _set({}, this.main_source_path, source)
	}

	var target = {}, path

	for (path in this.actions) {

		var values = this.actions[path].from.map(function (p){
			return _get(source, p)
		})

		var read_value = this.actions[path].read.apply(null, values)
		if (typeof read_value !== 'undefined') {
			_set(target, path, read_value)
		}
	}

	return target
}


Mapper.prototype.write = function (target, opts) {
	if (!_isObject(target) || _isArray(target)) return

	var source = {}, path

	for (path in this.actions) {
		var values = [].concat(this.actions[path].write(_get(target, path)))

		this.actions[path].from.forEach(function (source_path, i) {
			_set(source, source_path, values[i])
		})
	}

	if (opts && opts.as_main_source && this.main_source_path) {
		return _get(source, this.main_source_path)
	}

	return source
};


Mapper.prototype.sources = function(picked_paths, opts){
	var self = this
	var out = []

	var as_main_source = (opts && opts.as_main_source && self.main_source_path)


	if (!picked_paths || !picked_paths.length) {
		picked_paths = Object.keys(this.actions)
	}

	picked_paths.forEach(function (path) {
		if (_isString(path)) path = path.split('.')
		var action = self.actions[path[0]]
		if (!action) throw new Error('Missing output path: ' + path[0])

		var source_paths = (as_main_source) ? UGLY_remove_main_source_path(action.from) : action.from

		if (path.length > 1 && action.mapper) {
			out = out.concat(action.mapper().sources([path.slice(1)], {as_main_source: true}).map(prefixer(source_paths)))
		}
		else {
			out = out.concat(source_paths)
		}
	})

	return _uniq(out)

	function UGLY_remove_main_source_path(source_paths) {
		return source_paths.map(function (path) {
			return path.replace(self.main_source_path + '.', '')
		})
	}
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
	var output = {}, key

	for (key in node) {
		if (node[key] === true) {
			output.fields = output.fields || []
			output.fields.push(key)
		}
		else {
			output.from = output.from || {}
			output.from[key] = get_source_tree_for_node(node[key])
		}
	}

	return output
}



function normalize_actions(target_config, from_path) {
	var path

	for (path in target_config) {
		target_config[path] = PathConfig(target_config[path], from_path)
	}

	return target_config
}



function PathConfig(config, from_path) {
	if (_isString(config) || _isArray(config)) {
		config = {from: config}
	}

	to_abs_source_path = from_path ? prefixer(from_path) : identity

	config.from = [].concat(config.from).map(to_abs_source_path)
	config.read = config.read || pass_thru
	config.write = config.write || pass_thru

	return config
}



function pass_thru(value) { return value }





function Registry() {
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


function prefixer(prefix) {
	return function (str) {
		return prefix + '.' + str
	}
}

function identity(v) { return v }
