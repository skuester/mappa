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


	it ("can use a _read_if() and _write_if() guard function to decide if the operation should occur.", function () {
		var mapper = Mapper({
			name: {
				_read_if: function (source) {
					return source.data.id
				},
				_read: function (source) {
					return source.data.name
				},
				_write_if: function (value, source) {
					return value.length > 3
				},
				_write: function (value, source) {
					source.data = {name: value}
				}
			}
		})

		expect( mapper.read({data:{name: 'name value'}}) ).to.eql( {} )
		expect( mapper.read({data:{id: 123, name: 'name value'}}) ).to.eql( {name: 'name value'} )

		expect( mapper.write({name: 'max'}) ).to.eql( {})
		expect( mapper.write({name: 'maximus'}) ).to.eql( {data: {name: 'maximus'}})
	});


	// SUGAR


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


	it ("sets missing keys to undefined", function () {
		var mapper = Mapper({
			missing: 'UglyMissing'
		})

		expect( mapper.read({})  ).to.eql( {missing: undefined} )
		expect( mapper.write({}) ).to.eql( {UglyMissing: undefined} )
	});


	describe ("with an array", function () {
		it ("maps an array with a sub-mapper: helper.array()", function () {
			var mapper = Mapper({
				people: [ 'People', {name: 'PersonName'} ]
			})

			var source = {
				People: [
					{PersonName: 'A'},
					{PersonName: 'B'},
				]
			}

			var result = {
				people: [
					{name: 'A'},
					{name: 'B'},
				]
			}

			expect( mapper.read(source) ).to.eql( result )
			expect( mapper.write(result) ).to.eql( source )
		});
	});


	describe ("with an object", function () {
		it ("maps a nested object with a sub-mapper: helper.mapper()", function () {
			var mapper = Mapper({
				person: {
					name: 'PersonName'
				}
			})

			var source = {
				PersonName: 'PersonName value'
			}

			var result = {
				person: {
					name: 'PersonName value'
				}
			}

			expect( mapper.read(source) ).to.eql( result )
			expect( mapper.write(result) ).to.eql( source )
		});
	});


	// options

	it ("can modify an existing object during read() or write() with {to}", function () {
		var mapper = Mapper({
			renamed: 'uglyName',
		})

		var source = {
			uglyName: 'uglyName value'
		}

		var result = {
			renamed: 'uglyName value'
		}

		var obj

		obj = {}
		mapper.read(source, {to: obj})
		expect( obj ).to.eql( result )

		obj = {}
		mapper.write(result, {to: obj})
		expect( obj ).to.eql( source )
	});

});
