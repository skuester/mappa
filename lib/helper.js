var _get = require('lodash/get')
var _set = require('lodash/set')


module.exports = {
	read: read,
	write: write,
	key: key,
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
