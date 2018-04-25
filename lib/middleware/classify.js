let getId = require('../getId');
let softParse = require('../softParse');

module.exports = classify;

// infer semantic action and primary id of a request. returns one of
// - create
// - update
// - updateById
// - delete
// - deleteById
// - get
// - getById
// - unknown
// and an id, if any
function classify(req, res, next) {
  let swagger = req.swagger;
  let operation = swagger && swagger.operation;
  let operationId = operation && operation.operationId;
  let pathName = swagger && swagger.pathName;
  let response = operation && operation.responses && (operation.responses[200] || operation.responses[201]);
  let schema = response && response.schema;
  let bodySchema = operation && operation.parameters && operation.parameters.filter(function(param) {
    return param.in === 'body' && param.schema;
  }).map(function(param) {
    return param.schema;
  })[0];
  let body = softParse(req.body, {});
  let id;

  req.action = {
    type: type(),
    id: id,
    body: body,
    bodySchema: bodySchema,
  };

  res.set('X-Mock-Classification', req.action.type);

  console.log('classification:', req.action);

  next();

  function type() {
    if (req.method === 'DELETE' ||
      operationId && operationId.match(/^delete|remove|drop/i) ||
      pathName && pathName.match(/delete|remove|drop[^/]*$/i)) {
      id = getId(req.pathParams) || getId(req.query);
      if (id) return 'deleteById';
      return 'delete';
    }

    if (operationId && operationId.match(/^create|insert/i) ||
      pathName && pathName.match(/create|insert[^/]*$/i)) {
      return 'create';
    }

    if (req.method === 'POST') {
      id = getId(body, bodySchema) || getId(req.query, bodySchema) ||
        getId(req.pathParams, bodySchema);
      if (id) return 'updateById';
      return 'create';
    }

    if (req.method === 'PUT') {
      id = getId(req.pathParams, bodySchema) ||
        getId(body, bodySchema) || getId(req.query, bodySchema);
      if (id) return 'updateById';
      return 'create';
    }

    if (req.method === 'PATCH') {
      id = getId(req.pathParams, bodySchema) ||
        getId(body, bodySchema) || getId(req.query, bodySchema);
      if (id) return 'updateById';
      return 'update';
    }

    if (req.method === 'GET') {
      id = getId(req.pathParams, schema) ||
        getId(body, schema) || getId(req.query, schema);
      if (id) return 'getById';
      return 'get';
    }

    // TODO HEAD, OPTIONS, ...

    return 'unknown';
  }
}
