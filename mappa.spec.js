var Mapper = require('./mappa')
var expect = require('chai').expect


describe ("Mappa", function () {

	describe ("basic example", function () {
		var source, target, mapper

		beforeEach(function () {
			source = {
				person: {
					FirstName: 'John',
					LastName: 'Smith',
				}
			}

			target = {
				name: 'John Smith'
			}

			mapper = Mapper({
				target: {
					name: {
						from: ['person.FirstName', 'person.LastName'],
						read: function (first, last) {
							return first + ' ' + last
						},
						write: function (value) {
							return value.split(' ')
						}
					}
				}
			})
		})

		describe (".read()", function () {
			it ("pulls from the source object", function () {
				expect( mapper.read(source) ).to.eql( target )
			});

			it ("returns undefined when it cannot use the source", function () {
				expect( mapper.read() ).to.be.undefined
				expect( mapper.read(null) ).to.be.undefined
				expect( mapper.read("not an object") ).to.be.undefined
				expect( mapper.read([]) ).to.be.undefined
			});
		});


		describe (".write()", function () {
			it ("pulls from the target object", function () {
				expect( mapper.write(target) ).to.eql( source )
			});

			it ("returns undefined when it cannot use the target", function () {
				expect( mapper.write() ).to.be.undefined
				expect( mapper.write(null) ).to.be.undefined
				expect( mapper.write("not an object") ).to.be.undefined
				expect( mapper.write([]) ).to.be.undefined
			});
		});

	}); // basic examples

});
