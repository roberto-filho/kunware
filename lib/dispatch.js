let readFile = require( './readFile' );
let cluster = require( 'cluster' );
let minimist = require( 'minimist' );
let assert = require( 'assert' );
let pack = require( '../package.json' );
let enableDestroy = require( 'server-destroy' );
let swaggerMerge = require( './swaggerMerge' );
let swaggerMin = require( './swaggerMin' );
let yaml = require('js-yaml');
let fs = require('fs');

module.exports = dispatch;

function dispatch( argv, createApp ) {
  let args = minimist( argv.slice( 0 ) );

  if ( args.h || args.help ) return usage();
  if ( args.v || args.version ) return version();
  if ( args._.length === 0 ) return usage();
  if ( ( args.w || args.watch ) && cluster.isMaster ) return watch();
  parseConfig(args);

  return serve( args, createApp );
}

function usage() {
  return readFile( __dirname + '/../README.md' ).then( function( contents ) {
    console.log();
    console.log( contents.toString( 'utf-8' ).match( /```([\s\S]*?)```/ )[1].trim() );
  } );
}

function version() {
  return new Promise( function( resolve ) {
    console.log( pack.version );
    resolve();
  } );
}

function watch() {
  return new Promise( function( resolve ) {
    cluster.fork();
    cluster.on( 'exit', function( worker ) {
      console.log( 'Worker ' + worker.process.pid + ' died. Restarting...');
      cluster.fork();
    } );
    resolve();
  } );
}

function parseConfig(args) {
  let configDirectory = args.config || './config.yaml';
  if (!fs.existsSync(configDirectory)) {
    if (args.config) {
      throw new Error(`File ${args.config} does not exist`);
    }
    return;
  }

  let configFile = fs.statSync(configDirectory);
  if (!configFile.isFile()) {
    throw new Error(`Configuration file ${configDirectory} is not a file.`);
  }

  config = yaml.safeLoad(fs.readFileSync(configDirectory));
  Object.keys(config).forEach((key) => {
    if (!(key in args)) {
      args[key] = config[key];
    }
  });
}

function serve( args, createApp ) {
  return Promise.resolve(
    createApp( args._, args)
  ).then( function( app ) {
    // parse port and use 8000 as default if no custom port is set.
    let port = parseInt( args.p || args.port || 8000 );

    app.server = app.listen( port, function() {
      console.log( 'Kunware ready at http://localhost:' + port );
      if (args.ui !== false) console.log( 'Swagger UI at http://localhost:' + port + '/ui' );
      if ( args.k || args.killable ) console.log( 'Kill via http://localhost:' + port + '/kill' );
    } );

    enableDestroy( app.server );

    if ( args.w || args.watch ) poll( args._ );
  } );
}

function poll( apis, current ) {
  swaggerMerge( apis ).then( swaggerMin ).then( function( api ) {
    if ( current ) assert.deepEqual( api, current );

    current = api;

    setTimeout( function() {
      poll( apis, current );
    }, 1000 );
  } ).catch( function() {
    process.exit( 1 );
  } );
}
