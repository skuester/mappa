var _get = require('lodash/get')
var _set = require('lodash/set')
var _isEmpty = require('lodash/isempty')


module.exports = {
	read: read,
	write: write,
	key: key,
	array: array,
	mapper: mapper,
}


function read(path) {
	return function (source) {
		return _get(source, path)
	}
}


function write(path) {
	return function (value, source) {
		_set(source, path, value)
	}
}


function key(path) {
	return {
		_read: read(path),
		_write: write(path),
	}
}


function array(path, mapper) {
	var get = read(path)
	var set = write(path)

	return {
		_read: function (source) {
			var arr = get(source)
			if (_isEmpty(arr)) return []
			return arr.map(mapper.read)
		},
		_write: function (value, source) {
			if (!value) value = []
			return set(value.map(mapper.write), source)
		}
	}
}


function mapper(mapper) {
	return {
		_read: function (source) {
			return mapper.read(source)
		},
		_write: function (value, source) {
			return mapper.write(value, {to: source})
		}
	}
}
