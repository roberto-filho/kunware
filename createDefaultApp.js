let express = require( 'express' );
let kunware = require( './' );
let generate = kunware.generate;
let generate2 = kunware.generate2;

module.exports = createDefaultApp;

function createDefaultApp( apis, options ) {
  options = options || {};
  let app = express();

  app.get( '/api-docs', kunware.apiDocs( apis ) );
  app.use( '/ui', kunware.ui );

  if ( options.killable ) app.use( '/kill', kunware.kill );

  app.use(
    kunware.swagger( apis, app ),
    kunware.replay(),
    kunware.chance,
    kunware.time,
    kunware.status,
    kunware.mock( [
      generate.id,
      generate2.birthday,
      generate2.email,
      generate2.url,
      generate2.phone,
      generate2.city,
      generate2.country,
      generate2.street,
      generate2.zip,
      generate2.houseNo,
      generate2.prefix,
      generate2.first,
      generate2.last,
      generate2.description,
      generate2.summary,
      generate2.label,
      generate2.price,
      generate.string,
      generate.number,
      generate.integer,
      generate.boolean,
      generate.array,
      generate.object,
    ] ),
    kunware.override
  );

  if ( options.memory ) {
    app.use(
      kunware.classify,
      kunware.memory( options )
    );
  }

  app.use(
    kunware.send,
    kunware.notFound,
    kunware.sendError
  );

  return app;
}
