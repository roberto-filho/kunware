let _ = require( 'lodash' );
let softParse = require( '../softParse' );

module.exports = mock;

/*
 * Generates mock data using the given generator steps
 * see generate.js for example steps
 */
function mock( steps ) {
  return function( req, res, next ) {
    // Only generate mock data if we have a schema
    if ( !res.schema ) return next();

    // Add x-definition to api definitions
    _.each( req.swagger.api.definitions, ( definition, name ) => {
      definition['x-definition'] = name;
    } );

    let limits = softParse( req.headers['x-mock-size'], {} );
    let maxDepth = parseInt( req.headers['x-mock-depth'] || 5 );
    let useExample = ( req.headers['x-mock-example'] || 'disabled' ).toLowerCase() === 'enabled';
    if (useExample && !('example' in res.schema)) throw new Error(`No schema example found for path ${req.path}`);

    res.body_ = generate( 'root', res.schema, {
      chance: req.chance,
      limits,
      maxDepth,
    }, generate, 0 );

    function generate( name, schema, options, gen, depth ) {
      if (useExample) {
        return res.schema.example;
      } else {
        for ( let i = 0, l = steps.length; i < l; ++i ) {
          let value = steps[i]( name, schema, options, gen, depth );
          if ( value !== undefined ) return value;
        }
        return 'UNSUPPORTED';
      }
    }

    next();
  };
}
