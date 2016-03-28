var Mapper = require('./mappa')
var expect = require('chai').expect


describe ("Mappa", function () {

	it ("maps an object key with a _read and _write function", function () {
		var mapper = Mapper({
			name: {
				_read: function (source) {
					return source.data.OldName
				},
				_write: function (value, source) {
					source.data = {OldName: value}
				}
			}
		})

		var source = {
			data: {
				OldName: 'OldName Value',
			}
		}

		var result = {
			name: 'OldName Value'
		}

		expect( mapper.read(source) ).to.eql( result )
		expect( mapper.write(result) ).to.eql( source )
	});


	it ("maps an object path with a string", function () {
		var mapper = Mapper({
			name: 'data.OldName'
		})

		var source = {
			data: {
				OldName: 'OldName Value',
			}
		}

		var result = {
			name: 'OldName Value'
		}

		expect( mapper.read(source) ).to.eql( result )
		expect( mapper.write(result) ).to.eql( source )
	});


	it ("passes through a property as is when the name is the same", function () {
		var mapper = Mapper({
			same: '=',
			renamed: 'uglyName',
		})

		var source = {
			same: 'same value',
			uglyName: 'uglyName value'
		}

		var result = {
			same: 'same value',
			renamed: 'uglyName value',
		}

		expect( mapper.read(source) ).to.eql( result )
		expect( mapper.write(result) ).to.eql( source )
	});


});
