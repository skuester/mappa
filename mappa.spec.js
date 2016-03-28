var Mapper = require('./mappa')
var expect = require('chai').expect


describe ("Mappa", function () {

	it ("maps an object key with a _read and _write function", function () {
		var mapper = Mapper({
			name: {
				_read: function (source) {
					return source.OldName
				},
				_write: function (value, source) {
					source.OldName = value
				}
			}
		})

		var source = {
			OldName: 'OldName Value',
		}

		var result = {
			name: 'OldName Value'
		}

		expect( mapper.read(source) ).to.eql( result )
		expect( mapper.write(result) ).to.eql( source )
	});

});
