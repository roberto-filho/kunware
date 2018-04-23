let express = require('express');
let swaggerMiddleware = require('swagger-express-middleware');
let swaggerMerge = require('../swaggerMerge');
let swaggerMin = require('../swaggerMin');

module.exports = swagger;

// set up swagger-express-middleware, kunware-style
function swagger(apis, app) {
  if (!Array.isArray(apis)) apis = [apis];

  let ready = swaggerMerge(apis).then(swaggerMin).then(function(api) {
    return new Promise(function(resolve, reject) {
      swaggerMiddleware(api, app, function(err, middleware) {
        if (err) reject(err);

        resolve(express.Router().use(
          middleware.metadata(),
          middleware.CORS(),
          middleware.files(),
          middleware.parseRequest(),
          middleware.validateRequest(),
          function(err, req, res, next) {
            next(err.stack.match(/Maximum call stack size exceeded/) ? null : err);
          }
        ));
      });
    });
  });

  return function(req, res, next) {
    ready.then(function(router) {
      router.handle(req, res, next);
    }).catch(next);
  };
}
