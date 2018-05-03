let Chance = require('chance');

module.exports = chance;

/**
 * Add (seeded) chance object to the current request
 * and send the seed back to the client
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Object} next Express next callback
 */
function chance(req, res, next) {
  let seed = req.headers['x-mock-seed'] || (new Chance()).word();
  req.chance = new Chance([
    seed,
    JSON.stringify(req.pathParams),
    JSON.stringify(req.query),
    req.body,
  ].join(''));

  res.set('X-Mock-Seed', seed);

  next();
}
