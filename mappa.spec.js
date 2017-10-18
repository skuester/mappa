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
				to: {
					name: {
						from: ['person.FirstName', 'person.LastName'],
						read: function (first, last) {
							if (!first) return "default!"
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

			it ("calls the read() fn even when the values it needs are not present", function () {
				expect( mapper.read({foo: 'bar'}) ).to.eql( {name: 'default!'} )
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




	function sources_example() {
		return Mapper({
			to: {
				name: ['Person.FirstName', 'Person.LastName'],
				city: 'Address.CityName',
				age: 'Person.Age',
				other: 'TopLevel',
				deep: 'Person.Deep.Nesting'
			}
		})
	}


	describe (".sources()", function () {
		var mapper

		beforeEach(function () {
			mapper = sources_example()
		})

		it ("lists all the sources", function () {
			expect( mapper.sources() ).to.have.same.members([
				'Person.FirstName',
				'Person.LastName',
				'Person.Age',
				'Address.CityName',
				'TopLevel',
				'Person.Deep.Nesting',
			])
		});


		it ("lists the sources for selected paths", function () {
			expect( mapper.sources(['name', 'age']) ).to.have.same.members([
				'Person.FirstName',
				'Person.LastName',
				'Person.Age',
			])
		});
	});


	describe (".source_tree()", function () {
		var mapper

		beforeEach(function () {
			mapper = sources_example()
		})

		it ("lists all the sources", function () {
			expect( mapper.source_tree() ).to.have.same.members([
				'TopLevel',
				{
					from: 'Person',
					tree: [
						'FirstName',
						'LastName',
						'Age',
						{
							from: 'Deep',
							tree: ['Nesting']
						}
					]
				},
				{ from: 'Address', tree: ['CityName']},
			])
		});


		it ("lists the sources for selected paths", function () {
			expect( mapper.source_tree(['name', 'age']) ).to.have.same.members([
				{from: 'Person', tree: ['FirstName', 'LastName', 'Age']}
			])
		});
	});

});




