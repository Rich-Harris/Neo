/*jslint white: true */

/* BOILERPLATE STUFF.... */

var Neo = ( function () {

	'use strict';

	// Matrices are cool. You can do a lot of stuff with them, including transforming (scaling, rotating etc)
	// 2D graphics in a way that goes easy on your CPU. Here's what one looks like:
	//
	//   |--               --|
	//   |                   |
	//   |   1     0     0   |
	//   |                   |
	//   |   0     1     0   |
	//   |                   |
	//   |   0     0     1   |
	//   |                   |
	//   |--               --|
	//
	// This one is special - it is an example of an 'identity matrix'. It is special because it doesn't 'do'
	// anything.
	//
	// When we're dealing with 2D graphics, our matrices will have 3 rows and 3 columns like the one above.
	// Except that the bottom row will always be the same - [ 0 0 1 ] - so we don't bother storing it. As a
	// result, our matrices will always have 6 'elements', a to f:
	//
	//   |--               --|
	//   |                   |
	//   |   a     c     e   |
	//   |                   |
	//   |   b     d     f   |
	//   |                   |
	//   |   0     0     1   |
	//   |                   |
	//   |--               --|
	//
	// We can use this matrix to take a set of co-ordinates representing a shape, and transforming them to
	// a new set of co-ordinates.
	//
	// First, we need to create a matrix object like so:
	//
	//   var matrix = new Neo();   <--- if we don't specify the matrix elements, we get the identity matrix.

	var Neo = function ( a, b, c, d, e, f ) {
		if ( ( typeof a === 'object' ) && ( a.length === 6 ) ) {

			// looks like we've been passed an array of matrix elements
			this.elements = a;
		} else {

			if ( a !== undefined ) {
				// looks like we've been passed the elements as six arguments
				this.elements = [ a, b, c, d, e, f ];
			} else {
				// looks like we haven't been passed anything at all - create an identity matrix
				this.reset();
			}
		}
	};

	Neo.prototype = {
		
		// To transform a set of co-ordinates, you apply the matrix to a 'vector' representing
		// those co-ordinates:
		//
		//   newCoords = matrix.apply( x, y );
		//
		// If we were to write what's happening here using standard mathematical notation, it would
		// look like this (the dots indicate multiplication, not decimals):
		//
		//                 |--               --|     |-- --|     |--             --|
		//                 |                   |     |     |     |                 |
		//                 |   a     c     e   |     |  x  |     | a.x + c.y + e.1 |
		//                 |                   |     |     |     |                 |
		//   newCoords  =  |   b     d     f   |  .  |  y  |  =  | b.x + d.y + f.1 |
		//                 |                   |     |     |     |                 |
		//                 |   0     0     1   |     |  1  |     | 0.x + 0.y + 1.1 |
		//                 |                   |     |     |     |                 |
		//                 |--               --|     |-- --|     |--             --|
		//
		// Don't worry too much about the last '1' in the vector - it's just there to 'balance the
		// equations'. The end result is always [ new x, new y, 1 ] so we can ignore it, and not even
		// bother doing the calculations.
		//
		// For a well-illustrated primer on all this stuff, have a look at
		// http://commons.oreilly.com/wiki/index.php/SVG_Essentials/Matrix_Algebra.

		apply: function ( x, y, precision ) {
			if ( x !== undefined && x.length ) { // accept values separately or in an array
				y = x[1];
				x = x[0];
			}

			precision = precision || 7;

			// TODO what is the performance impact of the double type coercion?

			// For performance reasons, the elements are stored as an array ( [ a, b, c, d, e, f ] )
			// rather than as a hash ( { a: a, b: b, c: c, d: d, e: e, f: f } ). So in the code below,
			// this.elements[1] refers to the b, and so on.

			return [
				( this.elements[0] * x ) + ( this.elements[2] * y ) + this.elements[4], // new x
				( this.elements[1] * x ) + ( this.elements[3] * y ) + this.elements[5]  // new y
			];
		},

		

		// If we have a set of co-ordinates that we want to scale, then translate, then rotate, we could do all
		// those operations separately:
		//
		//   coords = [ 50, 50 ];
		//   scaled = scale.apply( coords );
		//   translated = translate.apply( scaled );
		//   rotated = rotate.apply( translated );
		//
		// But this is inefficient if we have to do it with lots of co-ordinates. Instead, we multiply the
		// matrices themselves:
		//
		//   transform = scale.multiply( translate ).multiply( rotate );
		//   newCoords = transform.apply( coords );
		//
		// The maths (not math, I'm British) looks like this:
		//
		//         |--             --|     |--             --|     |--                                                                  --|
		//         |                 |     |                 |     |                                                                      |
		//         |   a1   c1   e1  |     |   a2   c2   e2  |     | a1.a2 + c1.b2 + e1.0    a1.c2 + c1.d2 + e1.0    a1.e2 + c1.f2 + e1.1 |
		//         |                 |     |                 |     |                                                                      |
		//   m  =  |   b1   d1   f1  |  .  |   b2   d2   f2  |  =  | b1.a2 + d1.b2 + f1.0    b1.c2 + d1.d2 + f1.0    b1.e2 + d1.f2 + f1.1 |
		//         |                 |     |                 |     |                                                                      |
		//         |   0    0    1   |     |   0    0    1   |     |  0.a2 +  0.b2 + 1.0      0.c2 +  0.d2 + 1.0      0.e2 +  0.f2 +  1.1 |
		//         |                 |     |                 |     |                                                                      |
		//         |--             --|     |--             --|     |--                                                                  --|
		//
		// Of course, we can simplify those equations - no need to explicity multiply something by one or zero.

		multiply: function ( o ) {
			var
				m1 = this.elements,
				m2 = ( o instanceof Neo ) ? o.elements : arguments,
				m3 = new Neo(),

				a1 = m1[0],   a2 = m2[0],
				b1 = m1[1],   b2 = m2[1],
				c1 = m1[2],   c2 = m2[2],
				d1 = m1[3],   d2 = m2[3],
				e1 = m1[4],   e2 = m2[4],
				f1 = m1[5],   f2 = m2[5]
			;

			m3.elements = [
				( a1 * a2 ) + ( c1 * b2 ),      // a
				( b1 * a2 ) + ( d1 * b2 ),      // b
				( a1 * c2 ) + ( c1 * d2 ),      // c
				( b1 * c2 ) + ( d1 * d2 ),      // d
				( a1 * e2 ) + ( c1 * f2 ) + e1, // e
				( b1 * e2 ) + ( d1 * f2 ) + f1  // f
			];

			return m3;
		},


		// Here's where it gets fun. Any 'affine transformation' operation can be presented as a matrix multiplication.
		// This gives us a handy set of methods which are really just shortcuts to the more complex .multiply() method:

		translate: function ( tx, ty ) {
			return this.multiply( 1, 0, 0, 1, tx, ty );
		},

		translateX: function ( tx ) {
			return this.multiply( 1, 0, 0, 1, tx, 0 );
		},

		translateY: function ( ty ) {
			return this.multiply( 1, 0, 0, 1, 0, ty );
		},

		scale: function ( sx, sy, ox, oy ) {
			var scaled;

			sy = sy || sx;

			if ( ox !== undefined ) { // assume that if ox has been passed, oy has been too
				scaled = this.translate( -ox, -oy ).scale( sx, sy ).translate( ox, oy );
			} else {
				scaled = this.multiply( sx, 0, 0, sy, 0, 0 );
			}

			return scaled;
		},

		scaleX: function ( sx ) {
			return this.multiply( sx, 0, 0, 1, 0, 0 );
		},

		scaleY: function ( sy ) {
			return this.multiply( 1, 0, 0, sy, 0, 0 );
		},

		// we assume that angles are passed in as degrees, as this is the standard commonly used in CSS and elsewhere
		rotate: function ( r, ox, oy ) {
			var rotated;

			if ( ox !== undefined ) { // let's assume that if ox has been passed, oy has been too
				rotated = this.translate( -ox, -oy ).rotate( r ).translate( ox, oy );
			} else {
				rotated = this.rotateRad( r * 0.01745329251994 ); // convert degrees to radians
			}

			return rotated;
		},

		rotateRad: function ( r ) {
			var
				cosR = Math.cos( r ),
				sinR = Math.sin( r )
			;

			return this.multiply( cosR, sinR, -sinR, cosR, 0, 0 );
		},

		flipX: function () {
			return this.scale( -1, 1 );
		},

		flipY: function () {
			return this.scale( 1, -1 );
		},

		skewX: function ( ax ) {
			return this.skewXRad( ax * 0.01745329251994 );
		},

		skewY: function ( ay ) {
			return this.skewYRad( ay * 0.01745329251994 );
		},

		skewXRad: function ( ax ) {
			return this.multiply( 1, 0, Math.tan( ax ), 1, 0, 0 );
		},

		skewYRad: function ( ay ) {
			return this.multiply( 1, Math.tan( ay ), 0, 1, 0, 0 );
		},

		// Often, you want to 'decompose' a matrix to its constituent operations. For a full illustration of
		// how this works, refer to the comments below.
		//
		// matrix.decompose() returns an object with the following properties:
		//
		// rotationDegs, rotationRads, scaleX, scaleY, shear, translateX, translateY

		decompose: function () {
			this.decomposed = Neo.decompose( this );
			return this.decomposed;
		},

		clone: function () {
			var m = this.elements;

			return new Neo( m[0], m[1], m[2], m[3], m[4], m[5] );
		},

		// if you want to reverse the effect of a matrix, for some reason, you need to find its inverse:
		
		inverse: function () {
			var
				m = this.elements,
				determinant,
				inverted = new Neo(),
				i = inverted.elements
			;

			determinant = ( m[0] * m[3] ) - ( m[2] * m[1] );

			i[0] = (  m[3] / determinant );
			i[1] = ( -m[1] / determinant );
			i[2] = ( -m[2] / determinant );
			i[3] = (  m[0] / determinant );
			i[4] = (  ( ( m[2] * m[5] ) - ( m[4] * m[3] ) ) / determinant );
			i[5] = (  ( ( m[4] * m[1] ) - ( m[0] * m[5] ) ) / determinant );

			return inverted;
		},

		set: function ( a, b, c, d, e, f ) {
			this.elements = [ a, b, c, d, e, f ];
			this.decomposed = {};
			return this;
		},

		reset: function () {
			this.elements = [ 1, 0, 0, 1, 0, 0 ];
			this.decomposed = {
				rotate: 0,
				scaleX: 1,
				scaleY: 1,
				shear: 0,
				translateX: 0,
				translateY: 0
			};
			return this;
		},

		equals: function ( a, b, c, d, e, f, tolerance ) {
			var
				m,
				e1,
				e2,
				equals = true,
				i
			;

			if ( a instanceof Neo ) {
				m = a.elements;
				tolerance = ( b || 1e-7 );
			}

			else {
				m = [ a, b, c, d, e, f ];
				tolerance = ( tolerance || 1e-7 );
			}

			for ( i=0; i<6; i+=1 ) {
				e1 = this.elements[i];
				e2 = m[i];

				if ( ( e1 > e2 + tolerance ) || ( e1 < e2 - tolerance ) ) {
					equals = false;
				}
			}

			return equals;
		},

		toString: function () {
			return 'matrix(' + this.elements.join( ',' ) + ')';
		},

		toCSSString: function ( precision ) {
			var
				r2d = 57.29577951308232, // ( 180 / Math.PI ) - multiply by this to convert radians to degrees
				d = this.decompose(),
				m = this.elements,
				limit = +( '1e-' + ( precision || 7 ) ),
				s = function ( float ) {
					// We use toFixed() to ensure that 1.99999999999 and 2.0000000000001 (for example) are treated as the same, e.g. in scaleX versus scaleY.
					// The unary + operator turns it back to a sensible number, e.g. 1.0000000000 becomes 1
					return +( float ? float.toFixed( precision || 7 ) : false );
				},

				rotate     = ( ( d.rotate > limit ) && ( d.rotate < ( 360 - limit ) ) ) ? s( d.rotate * r2d ) + 'deg' : false,

				skewX      = ( ( d.shear > limit ) || ( d.shear < -limit ) ) ? s( Math.atan( d.shear ) * r2d ) + 'deg' : false,

				scaleX     = ( ( d.scaleX > ( 1 + limit ) ) || ( d.scaleX < ( 1 - limit ) ) ) ? s( d.scaleX ) : false,
				scaleY     = ( ( d.scaleY > ( 1 + limit ) ) || ( d.scaleY < ( 1 - limit ) ) ) ? s( d.scaleY ) : false,

				translateX = ( ( d.translateX > limit ) || ( d.translateX < -limit ) ) ? s( d.translateX ) + 'px' : false,
				translateY = ( ( d.translateY > limit ) || ( d.translateY < -limit ) ) ? s( d.translateY ) + 'px' : false,

				scale, translate,

				string
			;

			if ( rotate === '360deg' ) {
				rotate = false;
			}

			if ( ( scaleX !== false && scaleY !== false ) ) {
				if ( scaleX === scaleY ) {
					scale = scaleX;
				}

				else {
					scale = scaleX + ',' + scaleY;
				}
				
				scaleX = scaleY = false;
			}

			if ( ( translateX !== false ) && ( translateY !== false ) ) {
				translate = translateX + ',' + translateY;
				translateX = translateY = false;
			}

			if ( d ) {
				string = [ (  translate  ? ( 'translate('  + translate  + ')' ) : '' ), // no unary operator here because it contains a non-numeric (the comma)
				           (  translateX ? ( 'translateX(' + translateX + ')' ) : '' ),
				           (  translateY ? ( 'translateY(' + translateY + ')' ) : '' ),
				           (  rotate     ? ( 'rotate('     + rotate     + ')' ) : '' ),
				           (  scale      ? ( 'scale('      + scale      + ')' ) : '' ),
				           (  skewX      ? ( 'skewX('      + skewX      + ')' ) : '' ),
				           (  scaleX     ? ( 'scaleX('     + scaleX     + ')' ) : '' ),
				           (  scaleY     ? ( 'scaleY('     + scaleY     + ')' ) : '' ) ].join( ' ' );
			
			} else { // if matrix can't be decomposed, return as is
				string = 'matrix(' + m.join( ',' ) + ')';
			}

			return string;
		}
	};


	Neo.fromString = function ( string ) {
		var
			transformTypes = [
				'translate',
				'translateX',
				'translateY',
				'scale',
				'scaleX',
				'scaleY',
				'rotate',
				'skewX',
				'skewY',
				'matrix'
			],

			pattern = new RegExp( '(' + transformTypes.join( '|' ) + ')\\(([^\\)]+)\\)', 'gi' ),
			match,
			type,
			parameters,

			getParameters = function ( string ) {
				var
					split = string.split( ',' ),
					i,
					parameters = [],
					parameterString,

					rad2deg = ( 180 / Math.PI ),
					grad2deg = ( 200 / Math.PI ),
					turn2deg = 360,

					angleUnits = /grad|rad|deg|turn/,
					angleUnit,
					angle,
					match
				;

				for ( i=0; i<split.length; i+=1 ) {
					parameterString = split[i].replace( 'px', '' ); // TODO - support all CSS units

					match = angleUnits.exec( parameterString );
					if ( match ) {
						angle = +parameterString.replace( angleUnits, '' );
						angleUnit = match[0];

						switch ( angleUnit.toLowerCase() ) {
							case 'rad':
								angle *= rad2deg;
								break;

							case 'grad':
								angle *= grad2deg;
								break;

							case 'turn':
								angle *= turn2deg;
								break;
						}

						parameters[ parameters.length ] = angle;
					}

					else {
						parameters[ parameters.length ] = +parameterString;
					}
				}

				return parameters;
			},

			matrix = new Neo()
		;

		while ( match = pattern.exec( string ) ) {
			type = match[1].toLowerCase().replace( 'x', 'X' ).replace( 'y', 'Y' ).replace( 'iX', 'ix' ); // saves us a job later
			parameters = getParameters( match[2] );

			if ( type === 'matrix' ) {
				matrix.multiply.apply( matrix, parameters );
			} else {
				matrix[ type ].apply( matrix, parameters );
			}
		}

		return matrix;
	};


	Neo.decompose = function ( a, b, c, d, e, f ) {
		// Turns a matrix into a series of simple transformations.

		var
			m,
			result = {},

			mag,
			scaledShear,
			desheared,
			cosA,
			sinA,

			magnitude,
			dotProduct,
			scalar,
			combine
		;

		if ( a instanceof Neo ) {
			m = a.elements;
			a = m[0];
			b = m[1];
			c = m[2];
			d = m[3];
			e = m[4];
			f = m[5];
		}

		// Before we begin, check that this matrix can be decomposed:

		if ( ( ( a * d ) - ( b * c ) ) === 0 ) { // determinant equals zero. This happens when the x scale or y scale equals zero.
			return false;
		}

		// In the following notes, letters a to f represent elements of our matrix M as in the following diagram:
		//
		//         |--               --|
		//         |                   |
		//         |   a     c     e   |
		//         |                   |
		//   M  =  |   b     d     f   |
		//         |                   |
		//         |   0     0     1   |
		//         |                   |
		//         |--               --|
		//
		// Some of the steps are a little hard to grasp (speaking from experience), but the basic concept is this -
		// any matrix that combines one or more 'affine' transformations (scaling, rotating, shearing and
		// translating are affine transformations) can be reproduced with a rotation, followed by a shear along the
		// x axis, followed by a scale, followed by a translate.
		//
		// For example these transformations...
		//
		//     translate(300,100)
		//     scale(2)
		//
		// ...result in a transformation matrix that could have been reached this way instead:
		//
		//     rotate(0)
		//     shear(0)
		//     scale(2)
		//     translate(600,200)
		//
		// The technique used here (and elsewhere - see http://www.w3.org/TR/css3-2d-transforms/#matrix-decomposition,
		// https://github.com/mbostock/d3/blob/master/src/core/transform.js,
		// https://github.com/DmitryBaranovskiy/raphael/blob/master/raphael.core.js for other implementations) is to
		// 'undo' those steps one at a time.


		// First, find the translation:
		// ============================
		//
		// Whatever transformations have been applied to end up with this matrix, the translation vector is always
		// given by [ e, f ]:

		result.translateX = e;
		result.translateY = f;

		// When we recreate the matrix, the translation gets applied last.
		//
		// 'Undoing' the translation would mean resetting e and f (aka tx and ty) to 0. That would leave us with the
		// following 3 x 3 matrix:
		//
		//         |--               --|
		//         |                   |
		//         |   a     c     0   |
		//         |                   |
		//   M  =  |   b     d     0   |
		//         |                   |
		//         |   0     0     1   |
		//         |                   |
		//         |--               --|
		//
		// Good news - the zeroes and ones round the edge will have no effect on any remaining transformations, because
		// the matrices that describe scale, rotation and shearing only use a, b, c and d. So we can pretend we're
		// dealing with a 2 x 2 matrix rather than a 3 x 3 one:
		//
		//         |--         --|
		//         |             |
		//         |   a     c   |
		//   M  =  |             |
		//         |   b     d   |
		//         |             |
		//         |--         --|
		//
		// This makes the sums a bit more straightforward.

		// A trick I find really useful to help visualise what's going on is to think in terms of axes. Imagine a pair
		// of vectors = [ 1, 0 ] and [ 0, 1 ]. These represent our axes:
		//
		//
		//                                                       ◆ [ 0, 2 ]
		//                                                       |  y axis
		//                                                       |
		//           ◆ [ 0, 1 ]                                  |
		//           |  y axis                                   |
		//           |                        scale(2)  -->      |
		//           |                                           |
		//           o------◆ [ 1, 0 ]                           o------------◆ [ 2, 0 ]
		//                     x axis                                            x axis
		//
		//
		//           ◆ [ 0, 1 ]                                  o------◆ [ 1, 0 ]
		//           |  y axis                                   |         y axis
		//           |                       rotate(90deg)  -->  |
		//           |                                           |
		//           o------◆ [ 1, 0 ]                           ◆ [ 0, -1 ]
		//                     x axis                               x axis
		//
		//
		//
		//           ◆ [ 0, 1 ]                                     ◆ [ 0.5, 1 ]
		//           |  y axis                                     /    y axis
		//           |                       shear(0.5)  -->      /
		//           |                                           /
		//           o------◆ [ 1, 0 ]                           o------◆ [ 1, 0 ]
		//                     x axis                                      x axis
		//
		//
		//
		// (Mathematical purists will object - axes are infinite, and don't go 'from' somewhere 'to' somewhere. But as
		// a way of understanding what's happening, it works well - just don't take it too literally.)
		//
		// An important thing to notice is that in our matrix, the x axis is only affected by a and b, whereas the y axis
		// is only affected by c and d. To see this, consider the formula for multiplying a matrix by a vector:
		//
		// |--         --|     |--   --|     |--       --|
		// |             |     |       |     |           |
		// |   a     c   |     |   x   |     | a.x + c.y |
		// |             |  .  |       |  =  |           |
		// |   b     d   |     |   y   |     | b.x + d.y |
		// |             |     |       |     |           |
		// |--         --|     |--   --|     |--       --|
		//
		// So if the vector is [ 1, 0 ] - our x axis - we're multiplying c and d by zero. In other words, we can discard
		// them from the equation. The same goes, mutatis mutandis, for the y axis.
		//
		// This means it's really easy to visualise what a 2 by 2 matrix is doing to a co-ordinate system - grab a pen and
		// some graph paper, mark an X somewhere for your origin, and draw lines from the X to [ 1, 0 ] and [ 0, 1 ] for
		// your original axes, and from X to [ a, b ] and [ c, d ] for the axes transformed by your matrix.
		//
		// For this reason, I'm going to adopt the habit of referring to [ a, b ] as the 'x axis vector', and [ c, d ] as
		// the 'y axis vector'. (Again, mathematical purists will shriek. Sue me.)





		// Finding the x scale:
		// ====================
		//
		// The x scale is given by the magnitude of the x axis vector [ a, b ], the formula for which is
		//
		//   sqrt( a^2 + b^2 )
		//
		// Thinking of Pythagoras may aid comprehension. In this diagram o is the origin, X is the result of multiplying
		// our matrix M by [ 1, 0 ]:
		//
		//            X
		//           /|
		//          / |
		//    mag  /  |
		//        /   |  b       mag^2 = ( a^2 + b^2 )
		//       /    |
		//      o_____|
		//
		//         a

		magnitude = function ( vector ) {
			return Math.sqrt( ( vector[0] * vector[0] ) + ( vector[1] * vector[1] ) );
		};

		result.scaleX = mag = magnitude( [ a, b ] ); // we store the result in the variable mag - we need it in a moment

		// How do we 'undo' the x scale? We normalise the vector [ a, b ]. Normalising a vector means preserving its
		// direction while reducing its magnitude to 1.
		//
		// To normalise a vector [ p, q ], we divide its elements by the vector's magnitude
		//
		//   [ ( p / mag ), ( q / mag ) ]
		//
		// Let's normalise our x axis vector:

		a = ( a / mag );
		b = ( b / mag );

		// We'll fill out the rest later.



		// Next, calculate shear:
		// ======================
		//
		// Shear is a bit harder to understand. It describes how far points in the co-ordinate system described by our
		// matrix should move along the x axis, relative to their distance from it. So if a matrix M represented a
		// shear of 0.5 and there were no other transformations, a point P at [ 10, 10 ] would be transformed to the
		// result R like so:
		//
		//    R  =  ( M . P )  =  ( M . [ 10, 10 ] )  =  [ ( 10 + ( 0.5 * 10 ) ), 10 ]         = [ 15, 10 ]
		//
		//
		//                |   10,10   15,10
		//                |
		//                |      P___R
		//                |      |  /
		//                |      | /
		//                |      |/
		//    ------------O------=---- x
		//                |
		//                |
		//                |
		//                |
		//                |
		//
		// This makes perfect sense when you consider the matrix that describes a shear transformation, and the formula for
		// multiplying that matrix by a vector that describes a co-ordinate:
		//
		// |--         --|     |--   --|
		// |             |     |       |
		// |   1     S   |     |   x   |
		// |             |  .  |       |  =  [ ( ( 1 * x ) + ( S * y ) ), ( ( 0 * y ) + ( 1 * y ) ) ]    =  [ ( x + S.y ), y ]
		// |   0     1   |     |   y   |
		// |             |     |       |
		// |--         --|     |--   --|
		//
		// (NB: You can shear along the y axis as well as the x axis. But the resulting matrix can be described as a combination
		// of other transformations - rather than figure out which way is 'best', we assume that only an x axis shear was used.)
		//
		// Let's go back to our axes. Suppose we had applied an x scale, a y scale, and a shear, but no rotation (because that
		// would make the diagram too difficult to draw with ASCII characters!). We've already normalised our x axis vector,
		// so we're left with this:
		//
		//
		//                  ◆ [ c, d ]
		//                 /
		//                /
		//               /
		//              /
		//             /
		//            /
		//           /
		//          /
		//         /
		//        /
		//       o---◆ [ a, b ]
		//              x axis
		//
		// We can't calculate the shear without knowing the y scale, because the y scale magnifies the shear. But we can't know
		// the y scale until we've undone the shear.
		//
		// This sounds like a Catch-22, but it's not. What we need to do is find the 'dot product' of the normalised x axis
		// vector and the y axis vector. The dot product of two vectors is
		//
		//    [ a, c ] . [ b, d ] = ( a.b + d.c )

		dotProduct = function ( vector1, vector2 ) { // not a general dot product function - optimised for our case
			return ( ( vector1[0] * vector2[0]) + ( vector1[1] * vector2[1] ) );
		};

		// The dot product of two vectors is related to their length and the angle between them. Two vectors that are
		// perpendicular to each other (as would be the case if there were no shear) will have a dot product of zero.
		//
		// Applying it to our present problem gives us the length marked by L on this diagram (strictly speaking, marking
		// it on the diagram makes no sense because L is a scalar, not a vector - but correctness be damned, this is useful):
		//
		//
		//       <---- L --->
		//
		//       x - - - - -◆ [ c, d ]
		//                 /
		//       |        /
		//   y           /
		//       |      /
		//   s         /
		//   c   |    /
		//   a       /
		//   l   |  /
		//   e     /
		//       |/
		//       o---◆ [ a, b ]
		//              x axis
		//
		// Let's park L in a variable called scaledShear:

		scaledShear = dotProduct( [ a, b ], [ c, d ] );

		// Now we need to 'deshear' the matrix so that the y axis vector is perpendicular to the x axis vector (technically,
		// we say that we need to make the vectors 'orthogonal' - it means the same thing). How? We reverse the normalised
		// x axis vector, multiply it by L, and add it to the y axis vector. Adding vectors together like this is called
		// combination:

		combine = function ( vector1, vector2 ) {
			return [ ( vector1[0] + vector2[0] ), ( vector1[1] + vector2[1] ) ];
		};

		scalar = function ( vector, s ) {
			return [ ( vector[0] * s ), ( vector[1] * s ) ];
		};

		desheared = combine( scalar( [ a, b ], -scaledShear ), [ c, d ] );

		// We can now find the y scale the same way we found the x scale:

		result.scaleY = magnitude( [ desheared[0], desheared[1] ] );

		// And now that we know that, we can calculate the shear value:

		result.shear = scaledShear / result.scaleY;

		// We could update our matrix with the new values of c and d, but we don't actually need them for the next step.
		//
		// NB: You might have come across 'skew', rather than 'shear' - this is the case in CSS transforms, for example.
		// They are basically the same, except skew is given as an angle:
		//
		//                |--         --|
		//                |             |
		//                |   1  tan(A) |
		//   skewX(A)  =  |             |
		//                |   0     1   |
		//                |             |
		//                |--         --|
		



		// Finally:
		// ========
		//
		// We're left with a simple rotation matrix. As you may know, a rotation of angle x is described in matrix-ese like so:
		//
		//         |--            --|
		//         |                |
		//         | cos(x) -sin(x) |
		//   M  =  |                |
		//         | sin(x)  cos(x) |
		//         |                |
		//         |--            --|
		//
		// In other words, a and d should be identical, and b and c should be opposites. (If they're not, there's not much we
		// can do about it...)

		cosA = a;
		sinA = b;

		// So we can find x using arccos( a ), right? Not quite. We're expecting a value between 0 (no rotation) and 2pi (a
		// complete rotation), but arccos( a ) will only give us a value between 0 and pi. That's because
		//
		//    cos( pi + n ) = cos( pi - n )
		//
		// However if you look at a graph of y = sin(x) superimposed on a graph of y = cos(x), you notice something useful:
		//
		//    http://fooplot.com/index.php?q0=sin(x)&y1=cos(x)
		//
		// If x is between 0 and pi, sin(x) is positive. If x is between pi and 2pi, sin(x) is negative. This means that:

		if ( sinA >= 0 ) {
			result.rotate = Math.acos( cosA ); // remember, this value is in radians not degrees
		} else {
			result.rotate = ( ( 2 * Math.PI ) - Math.acos( cosA ) );
		}

		result.rotationRads = result.rotate;
		result.rotationDegs = result.rotationRads * ( 180 / Math.PI ); // TODO neaten this up, remove deprecated .rotate

		// That's it! Just remember to reapply the transforms in the correct order - rotate, skew, scale, translate.

		return result;
	};

	return Neo;
}());