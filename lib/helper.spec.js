var expect = require('chai').expect
var Mapper = require('../mappa')
var m = Mapper.helper


describe ("Mappa.helper", function () {

	describe (".read()", function () {
		var mapper, source, target


		it ("can be used to get an object paths", function () {
			var mapper = Mapper({
				name: {
					_read: m.read('OldName'),
				}
			})

			var source = {
				OldName: 'OldName Value',
			}

			var target = {
				name: 'OldName Value'
			}

			expect( mapper.read(source) ).to.eql( target )
		});
	});


	describe (".write()", function () {
		var mapper, source, target


		it ("can be used to set object paths", function () {
			var mapper = Mapper({
				name: {
					_write: m.write('OldName')
				}
			})

			var source = {
				OldName: 'OldName Value',
			}

			var target = {
				name: 'OldName Value'
			}

			expect( mapper.write(target) ).to.eql( source )
		});
	});


	describe (".key()", function () {
		var mapper, source, target


		it ("can be used to get AND set object paths", function () {
			var mapper = Mapper({
				name: m.key('OldName')
			})

			var source = {
				OldName: 'OldName Value',
			}

			var target = {
				name: 'OldName Value'
			}

			expect( mapper.read(source) ).to.eql( target )
			expect( mapper.write(target) ).to.eql( source )
		});
	});






	describe (".array()", function () {

		it ("can be used to map an array with another mapper", function () {
			var mapper = Mapper({
				people: m.array('People', Mapper({
					name: 'PersonName'
				}))
			})

			var source = {
				People: [
					{PersonName: 'A'},
					{PersonName: 'B'},
				]
			}

			var target = {
				people: [
					{name: 'A'},
					{name: 'B'},
				]
			}

			expect( mapper.read(source) ).to.eql( target )
			expect( mapper.write(target) ).to.eql( source )
		});


		it ("always returns an array when no source is available", function () {
			var mapper = Mapper({
				people: m.array('People', Mapper({
					name: 'PersonName'
				}))
			})

			expect( mapper.read({}) ).to.eql( {people: []} )
			expect( mapper.write({people: undefined}) ).to.eql( {People: []} )
		});
	});


	describe (".mapper()", function () {

		it ("can be used to map a sub-object with another mapper", function () {
			var mapper = Mapper({
				person: m.mapper(Mapper({
					name: 'PersonName'
				}))
			})

			var source = {
				PersonName: 'PersonName value'
			}

			var target = {
				person: {
					name: 'PersonName value'
				}
			}

			expect( mapper.read(source) ).to.eql( target )
			expect( mapper.write(target) ).to.eql( source )
		});

	});

});
