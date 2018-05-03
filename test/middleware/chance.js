const assert = require('assert');
const sinon = require('sinon');
const chance = require('../../lib/middleware/chance');

describe('The chance middleware', function(done) {
  it('should create a chance and return the seed without anything given', function(done) {
    let req = {headers: {}};
    let res = {set: sinon.spy()};
    chance(req, {set: () => null}, assertChance);

    function assertChance() {
      assert.ok(req.chance);
      res.set.calledOnceWith('X-Mock-Seed');
      done();
    }
  });

  it('should set the same chance if seed is the same and return the seed', function(done) {
    let req = {headers: {'x-mock-seed': 'seed'}};
    let res = {set: sinon.spy()};
    let word = '';
    chance(req, {set: () => null}, assertChance);

    function assertChance() {
      assert.ok(req.chance);
      res.set.calledOnceWithExactly('X-Mock-Seed', 'seed');
      word = req.chance.word();
      req = {headers: {'x-mock-seed': 'seed'}};
      chance(req, {set: () => null}, assertSameWord);
    }

    function assertSameWord() {
      assert.equal(req.chance.word(), word);
      done();
    }
  });
});
