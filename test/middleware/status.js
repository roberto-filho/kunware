const assert = require('assert');
const status = require('../../lib/middleware/status');

describe('The status middleware', function() {
  it('should set the status to be the lowest status if only full of status numbers', function(done) {
    let responses = {};
    ['200', '300', '404'].forEach((code) => {
      responses[code] = {schema: code};
    });
    let req = {swagger: {operation: {responses: responses}}, headers: {}};
    let res = {};
    status(req, res, assertStatus);

    function assertStatus() {
      assert.equal(res.status_, '200');
      assert.equal(res.schema, '200');
      done();
    }
  });

  it('should set the status to default if present', function(done) {
    let responses = {};
    ['200', '300', 'default', '404'].forEach((code) => {
      responses[code] = {schema: code};
    });
    let req = {swagger: {operation: {responses: responses}}, headers: {}};
    let res = {};
    status(req, res, assertStatus);

    function assertStatus() {
      assert.equal(res.status_, 'default');
      assert.equal(res.schema, 'default');
      done();
    }
  });

  it('should set the given status', function(done) {
    let responses = {};
    ['200', '300', 'default', '404'].forEach((code) => {
      responses[code] = {schema: code};
    });
    let req = {swagger: {operation: {responses: responses}}, headers: {'x-mock-status': '300'}};
    let res = {};
    status(req, res, assertStatus);

    function assertStatus() {
      assert.equal(res.status_, '300');
      assert.equal(res.schema, '300');
      done();
    }
  });

  it('should throw an error if setting a status that is not in the operations', function() {
    let responses = {};
    ['200', '300', 'default', '404'].forEach((code) => {
      responses[code] = {schema: code};
    });
    let req = {swagger: {operation: {responses: responses}}, headers: {'x-mock-status': '403'}};
    let res = {};
    assert.throws(function() {
      status(req, res, null);
    }, /Invalid/);
  });
});
