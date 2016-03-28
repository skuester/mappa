var _get = require('lodash/get')
var _set = require('lodash/set')
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
		Object.keys(config).forEach(function (key) {

			read_ops.push(function (source, obj) {
				_set(obj, key, config[key]._read(source) )
			})

			write_ops.push(function (obj, source) {
				config[key]._write(_get(obj, key), source)
			})
		})
	}
}
