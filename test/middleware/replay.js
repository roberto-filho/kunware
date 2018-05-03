const assert = require('assert');
const replay = require('../../lib/middleware/replay');

describe('The replay middleware', function() {
  it('should replay headers given the amount of times only', function(done) {
    let replayMiddleware = replay();
    let counter = 3;
    let req = {'headers': {'x-mock-replay': counter, 'x-mock-example': 'enabled'}, 'originalUrl': 'someUrl'};
    replayMiddleware(req, null, newRequest);

    function newRequest() {
      req.headers = {};
      counter--;
      replayMiddleware(req, null, assertEquality);
    }

    function assertEquality() {
      assert.deepStrictEqual(req.headers, {'x-mock-example': 'enabled'});
      if (counter > 0) {
        newRequest();
      } else {
        req.headers = {};
        replayMiddleware(req, null, assertClean);
      }
    }

    function assertClean() {
      assert.deepStrictEqual(req.headers, {});
      done();
    }
  });

  it('should not replay anything by default', function(done) {
    replayMiddleware = replay();
    req = {'headers': {}, 'originalUrl': 'someUrl'};
    replayMiddleware(req, null, assertClean);

    function assertClean() {
      assert.deepStrictEqual(req.headers, {});
      done();
    }
  });

  describe('pattern matching', function() {
    it('should match the original url if no pattern is given', function(done) {
      let replayMiddleware = replay();
      let req = {'headers': {'x-mock-replay': 1, 'x-mock-example': 'enabled'}, 'originalUrl': 'someUrl'};
      replayMiddleware(req, null, newRequest);

      function newRequest() {
        req.headers = {};
        req.originalUrl = 'different location';
        replayMiddleware(req, null, assertClean);
      }

      function assertClean() {
        assert.deepStrictEqual(req.headers, {});
        req.originalUrl = 'someUrl';
        replayMiddleware(req, null, assertEquality);
      }

      function assertEquality() {
        assert.deepStrictEqual(req.headers, {'x-mock-example': 'enabled'});
        done();
      }
    });

    it('should match the url with the given pattern only', function(done) {
      let replayMiddleware = replay();
      let req = {'headers': {'x-mock-replay': 1, 'x-mock-replay-pattern': 'different location', 'x-mock-example': 'enabled'}, 'originalUrl': 'someUrl'};
      replayMiddleware(req, null, newRequest);

      function newRequest() {
        req.headers = {};
        replayMiddleware(req, null, assertClean);
      }

      function assertClean() {
        assert.deepStrictEqual(req.headers, {});
        req.originalUrl = 'different location';
        replayMiddleware(req, null, assertEquality);
      }

      function assertEquality() {
        assert.deepStrictEqual(req.headers, {'x-mock-example': 'enabled'});
        done();
      }
    });
  });
});
