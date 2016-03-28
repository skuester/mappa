var expect = require('chai').expect
var Mapper = require('../mappa')
var m = Mapper.helper


describe ("Mappa.helper", function () {

	describe (".read() and .write()", function () {
		it ("can be used to get and set object paths", function () {
			var mapper = Mapper({
				name: {
					_read: m.read('OldName'),
					_write: m.write('OldName')
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
});
