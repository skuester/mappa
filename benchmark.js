"use strict";

var Benchmark = require('benchmark')
var suite = new Benchmark.Suite()

var Mapper = require('./mappa')

var mapper = Mapper({
	to: {
		name: {
			from: ['Person.FirstName', 'Person.LastName'],
			read: function (first) {
				return first
			}
		},
		city: 'Address.CityName',
		deep: 'Person.Deep.Nesting',
	}
})

var source = {
	Person: {
		FirstName: 'first name',
		LastName: 'last name',
		Deep: {
			Nesting: 'deep nesting'
		}
	},
	Address: {
		CityName: 'city name'
	}
}

var target = {
	name: 'Boo Radley',
	city: 'Chicago',
	deep: 'so, so deep'
}




suite
	.add('source_tree()', function () {
		mapper.source_tree()
	})
	.add('source_tree() for select keys', function () {
		mapper.source_tree(['name', 'deep'])
	})


	.add('sources()', function () {
		mapper.sources()
	})
	.add('sources() for select keys', function () {
		mapper.sources(['name', 'deep'])
	})



	.add('read()', function () {
		mapper.read(source)
	})


	.add('write()', function () {
		mapper.write(target)
	})



	// add listeners
	.on('cycle', function(event) {
		console.log(String(event.target));
	})
	.on('complete', function() {
		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	.run();



/*
--------------------------------------
	CURRENT BEST
--------------------------------------
source_tree() x 39,035 ops/sec ±2.20% (87 runs sampled)
source_tree() for select keys x 45,090 ops/sec ±2.10% (82 runs sampled)
sources() x 1,535,816 ops/sec ±2.10% (83 runs sampled)
sources() for select keys x 851,586 ops/sec ±2.48% (78 runs sampled)
read() x 43,883 ops/sec ±2.30% (80 runs sampled)
write() x 32,832 ops/sec ±2.56% (72 runs sampled)
Fastest is sources()

*/
