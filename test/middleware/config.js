const assert = require('assert');
const rewire = require('rewire');
const sinon = require('sinon');
const request = require('../request');
const config = rewire('../../lib/middleware/config');
const express = require('express');

describe('The configuration middleware', function() {
  it('should throw an error on wrong options', function() {
    assert.throws(function() {
      config({'config-back': false});
    }, /config-back is set to false/);
  });

  describe('with UI', function() {
    const uiApp = express();
    const port = 16000;
    let server;

    before(function(done) {
      uiApp.use(config({'config-ui': true}));
      server = uiApp.listen(port, done);
    });

    after(function(done) {
      server.close();
      done();
    });

    it('should have a /config/ui endpoint', function() {
      return request(`http://localhost:${port}/config/ui`).then(function(res) {
        assert.ok(res.body.match(/Kunware Configuration/));
        assert.equal(res.statusCode, 200);
      });
    });

    it('should have a GET /config endpoint', function() {
      config.__set__('config.time', 500);
      return request(`http://localhost:${port}/config`, {json: true}).then(function(res) {
        assert.equal(res.body.time, 500);
        assert.equal(res.statusCode, 200);
      });
    });

    it('should have a GET /config/list endpoint', function() {
      config.__set__('config.time', 500);
      return request(`http://localhost:${port}/config/list`, {json: true}).then(function(res) {
        assert.equal(res.body.length, config.__get__('configList').length);
        assert.ok(res.body[0]['validatorString']);
        assert.equal(res.statusCode, 200);
      });
    });

    it('should have a POST /config endpoint', function() {
      return request(`http://localhost:${port}/config`, {method: 'POST', json: {status: 200}}).then(function(res) {
        assert.equal(config.__get__('config.status'), 200);
        assert.equal(res.body.config.status, 200);
        assert.equal(res.statusCode, 200);
      });
    });
  });

  describe('without UI', function() {
    const app = express();
    const port = 16000;

    before(function(done) {
      app.use(config({'config-ui': false}));
      app.listen(port, done);
    });

    it('should have no ui', function() {
      return request(`http://localhost:${port}/config/ui`).then(function(res) {
        assert.equal(res.statusCode, 404);
      });
    });

    describe('the config injector', function() {
      const app = express();
      const port = 17000;
      const middlewareSpy = sinon.spy();

      before(function(done) {
        app.use(config({'config-ui': false, 'example': 'enabled', 'seed': 'kunware seed'}), function(req, res, next) {
          middlewareSpy(req); next();
        });
        app.listen(port, done);
      });

      afterEach(function(done) {
        middlewareSpy.resetHistory();
        done();
      });

      it('should overwrite options', function() {
        config.__set__('config.example', 'disabled');
        return request(`http://localhost:${port}/sample`).then(function(res) {
          assert.equal(middlewareSpy.args[0][0].headers['x-mock-example'], 'disabled');
        });
      });

      it('should use options when no config options', function() {
        return request(`http://localhost:${port}/sample`).then(function(res) {
          assert.equal(middlewareSpy.args[0][0].headers['x-mock-seed'], 'kunware seed');
        });
      });

      it('should not overwrite headers', function() {
        config.__set__('config.example', 'disabled');
        return request(`http://localhost:${port}/sample`, {headers: {'x-mock-example': 'preferably'}}).then(function(res) {
          assert.equal(middlewareSpy.args[0][0].headers['x-mock-example'], 'preferably');
        });
      });
    });
  });
})
;
