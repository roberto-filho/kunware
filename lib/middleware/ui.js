var express = require( 'express' );
var path = require( 'path' );

// render kunware specific swagger ui
module.exports = express.Router().use(
  express.static( __dirname + '/../../public' ),
  express.static( path.dirname( require.resolve( 'swagger-ui' ) ) )
);
