const assert = require('assert');
const time = require('../../lib/middleware/time');

describe('The time middleware', function() {
  it('should not delay the request by default', function(done) {
    global.setTimeout = function(next, timeout) {
      assert.equal(timeout, 0);
      done();
    };
    time({headers: {}}, {}, null);
  });

  it('should delay the request by the given header', function(done) {
    global.setTimeout = function(next, timeout) {
      assert.equal(timeout, 500);
      done();
    };
    time({headers: {'x-mock-time': 500}}, {}, null);
  });
});
