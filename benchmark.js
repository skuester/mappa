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
source_tree() x 32,207 ops/sec ±1.40% (84 runs sampled)
source_tree() for select keys x 39,733 ops/sec ±1.23% (86 runs sampled)
sources() x 872,653 ops/sec ±2.27% (79 runs sampled)
sources() for select keys x 617,370 ops/sec ±1.78% (81 runs sampled)
read() x 43,493 ops/sec ±1.21% (86 runs sampled)
write() x 33,060 ops/sec ±0.90% (87 runs sampled)
Fastest is sources()

*/
