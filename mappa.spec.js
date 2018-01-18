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


	describe ("main_source_path", function () {
		it ("returns the primary top-level path if there is one", function () {
			var mapper = Mapper({
				from: 'Foo',
				to: {}
			})
			expect( mapper.main_source_path ).to.eql( 'Foo' )
		});
	});





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




	describe ("nested mappers with a registry", function () {
		var source, target, mappers

		beforeEach(function () {
			mappers = Mapper.Registry()

			source = {
				regMember: {
					ID: 123,
					profile: {
						FirstName: 'first',
						LastName: 'last',
						address: {
							Address1: '123 Street'
						}
					}
				}
			}

			target = {
				id: 123,
				profile: {
					name: 'first last',
					address: {
						street1: '123 Street'
					}
				}
			}

			mappers.define('person', {
				from: 'Person',
				to: {
					name: {
						from: ['FirstName', 'LastName'],
						read: function (first, last) {
							return [first, last].join(' ')
						},
						write: function (name) {
							return name.split(' ')
						}
					},
					address: mappers.use('address', {from: 'address'})
				}
			})

			mappers.define('member', {
				from: 'regMember',
				to: {
					id: 'ID',
					profile: mappers.use('person', {from: 'profile'})
				}
			})


			mappers.define('address', {
				from: 'Address',
				to: {
					street1: 'Address1'
				}
			})
		})


		it ("read()s correctly, using the main_source_path for nested mappers", function () {
			expect( mappers.get('member').read(source) ).to.eql( target )
		});

		it ("writes()s correctly", function () {
			expect( mappers.get('member').write(target) ).to.eql( source )
		});

		describe (".sources()", function () {
			it ("returns a list of only immediate sources when unqualified, to avoid loops", function () {
				expect( mappers.get('member').sources() ).to.eql([
					'regMember.ID',
					'regMember.profile',
				])
			});

			it ("traverses related mappers when needed", function () {
				expect( mappers.get('member').sources(['profile']) ).to.eql(['regMember.profile'])
				expect( mappers.get('member').sources(['profile.name']) ).to.eql(['regMember.profile.FirstName', 'regMember.profile.LastName'])
				expect( mappers.get('member').sources(['profile.address.street1']) ).to.eql(['regMember.profile.address.Address1'])
			});

			it ("returns a full list for specific keys", function () {
				expect( mappers.get('member').sources(['id', 'profile.name', 'profile.address.street1']) ).to.eql([
					'regMember.ID',
					'regMember.profile.FirstName',
					'regMember.profile.LastName',
					'regMember.profile.address.Address1',
				])
			});


			it ("ignores duplicates", function () {
				expect( mappers.get('member').sources(['profile.name', 'profile.name']) ).to.eql([
					'regMember.profile.FirstName',
					'regMember.profile.LastName',
				])
			});
		});




		describe (".source_tree()", function () {
			it ("works with immediate sources when no fields present", function () {
				expect( mappers.get('member').source_tree() ).to.eql({
					from: {
						regMember: {
							fields: ['ID', 'profile']
						}
					}
				})
			});

			it ("works with nested mappers", function () {
				expect( mappers.get('member').source_tree(['profile.address.street1']) ).to.eql({
					from: {
						regMember: {
							from: {
								profile: {
									from: {
										address: {
											fields: ['Address1']
										}
									}
								}
							}
						}
					}
				})
			});
		});
	});


});




