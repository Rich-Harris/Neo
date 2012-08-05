Neo.js
======

a matrix manipulation library that tries to explain what the hell's going on
----------------------------------------------------------------------------

*No one can be told what the Matrix is. You have to see it for yourself* -- Morpheus


Some time ago I was writing graphics code for an HTML5 game engine. Turns out you pretty quickly get involved in matrix algebra any time you need to move ('translate'), spin ('rotate'), or embiggen ('scale') any of your game objects without it slowing things to a crawl.

Here's the thing: I clearly didn't pay enough attention in mathematics at school. This stuff is *really confusing* for anyone with a humanities degree. There are some great libraries out there for doing matrix operations (e.g. [Sylvester](http://sylvester.jcoglan.com/), or the stuff in [Raphael](https://github.com/DmitryBaranovskiy/raphael/) and [d3](https://github.com/mbostock/d3/)), but if you want to understand what's going on under the hood you're out of luck.

I wanted a standalone library that would help me do matrix operations **optimised for 2D graphics** without confusing the hell out of me. I couldn't find one, so I wrote Neo.js.


Usage
-----

Include Neo.js somewhere on your page, then

    var matrix = new Neo();

This will create a new identity matrix. Alternatively, initialise it like so :

    var matrix = new Neo( a, b, c, d, e, f );

or

    var matrix = new Neo([ a, b, c, d, e, f ]);

or

    var matrix = Neo.fromString( 'scale(2),translate(50,100)' ); // for example

Calling one of the following methods will return a new matrix:

    matrix.multiply( otherMatrix );
    matrix.multiply( a, b, c, d, e, f );
    matrix.translate( tx, ty );
    matrix.translateX( tx );
    matrix.translateY( ty );
    matrix.scale( s );
    matrix.scaleX( sx );
    matrix.scaleY( sy );
    matrix.rotate( angle );
    matrix.rotateRad( angleRads );
    matrix.flipX();
    matrix.flipY();
    matrix.skewX( angle );
    matrix.skewY( angle );
    matrix.skewXRad( angleRads );
    matrix.skewYRad( angleRads );


You can decompose the matrix to its constituent operations like so...

    matrix.decompose();

...or find its inverse:

    matrix.inverse();

Other methods:

    matrix.set( a, b, c, d, e, f );
    matrix.reset(); // identity matrix
    matrix.clone();
    matrix.equals( otherMatrix ); returns true or false
    matrix.toString();



Feedback
--------

I'd love to know if you're using this somewhere. Drop me a line at [@rich_harris](http://twitter.com/rich_harris). Especially if you find bugs tec.


License
-------

Released under the [WTFPL license](http://en.wikipedia.org/wiki/WTFPL).