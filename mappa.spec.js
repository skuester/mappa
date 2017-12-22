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
				},
				simple_key: 'simple_key value',
			}

			target = {
				name: 'John Smith',
				simple: 'simple_key value',
			}

			mapper = Mapper({
				to: {
					name: {
						from: ['person.FirstName', 'person.LastName'],
						read: function (first, last) {
							if (!first) return "default!"
							if (first == "return_undefined") return
							return first + ' ' + last
						},
						write: function (value) {
							return value.split(' ')
						}
					},
					simple: 'simple_key'
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

			it ("does not output the target key if the read fn returns undefined", function () {
				expect( mapper.read({person: {FirstName: 'return_undefined'}}) ).to.eql( {} )
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





	describe (".sources()", function () {
		var mapper

		beforeEach(function () {
			mapper = Mapper({
				to: {
					name: ['Person.FirstName', 'Person.LastName'],
					city: 'Address.CityName',
					age: 'Person.Age',
					other: 'TopLevel',
					deep: 'Person.Deep.Nesting',
					duplicate: 'Person.FirstName',
				}
			})
		})

		it ("lists all the sources, ignoring duplicates", function () {
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
			mapper = Mapper({
				to: {
					name: ['Person.FirstName', 'Person.LastName'],
					first_name: 'Person.FirstName',
					city: 'Address.CityName',
					age: 'Person.Age',
					other: 'TopLevel',
					deep: 'Person.Deep.Nesting',
					duplicate_name_in_child: 'Duplicate.Person.FirstName',
				}
			})
		})

		it ("lists all the unique sources", function () {
			expect( mapper.source_tree() ).to.eql({
				fields: ['TopLevel'],
				from: {
					Person: {
						fields: ['FirstName', 'LastName', 'Age'],
						from: {
							Deep: {
								fields: ['Nesting']
							}
						}
					},
					Address: {
						fields: ['CityName'],
					},
					Duplicate: {
						from: {
							Person: {
								fields: ['FirstName'],
							}
						}
					}
				}
			})
		})

		it ("lists all the unique sources from selected keys", function () {
			expect( mapper.source_tree(['name', 'first_name']) ).to.eql({
				from: {
					Person: {
						fields: ['FirstName', 'LastName']
					}
				}
			})

			expect( mapper.source_tree(['deep']) ).to.eql({
				from: {
					Person: {
						from: {
							Deep: {
								fields: ['Nesting']
							}
						}
					}
				}
			})
		});

	})


});




