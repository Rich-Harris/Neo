// TODO - write moar tests!

test( 'Creating a new identity matrix', function () {
	var neo = new Neo();

	ok( neo !== undefined, 'new Neo()' );
	deepEqual( neo.elements, [ 1, 0, 0, 1, 0, 0 ], 'initialises as identity matrix' );
});

test( 'Creating a new matrix from an array', function () {
	var neo = new Neo([ 2, 0, 0, 2, 50, 50 ]);

	deepEqual( neo.elements, [ 2, 0, 0, 2, 50, 50 ], 'element values are correct' );
});

test( 'Creating a new matrix from arguments', function () {
	var neo = new Neo( 2, 0, 0, 2, 50, 50 );

	deepEqual( neo.elements, [ 2, 0, 0, 2, 50, 50 ], 'element values are correct' );
});

test( 'Matrix methods do not mutate the original matrix', function () {
	var neo1 = new Neo( 2, 0, 0, 2, 50, 50 ), neo2 = new Neo( 3, 1, -1, 3, 100, 100 );

	neo1.multiply( neo2 );
	neo1.translate( 50, 50 );
	neo1.scale( 4 );

	deepEqual( neo1.elements, [ 2, 0, 0, 2, 50, 50 ], 'element values are correct' );
});

test( 'Matrix multiplication', function () {
	var neo1 = new Neo( 2, 0, 0, 2, 50, 50 ), neo2 = new Neo( 3, 1, -1, 3, 100, 100 ), result;

	result = neo1.multiply( neo2 );
	
	deepEqual( result.elements, [ 6, 2, -2, 6, 250, 250 ], 'element values are correct' );
});

