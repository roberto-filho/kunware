let assert = require( 'assert' );
let rewire = require('rewire');
let sinon = require('sinon');

let dispatch = rewire( '../lib/dispatch' );

describe( 'The dispatcher', function() {
  it( 'should report usage', function() {
    return dispatch( [], null );
  } );

  it( 'should have a version option', function() {
    return dispatch( ['-v'], null );
  } );

  it( 'should have a help option', function() {
    return dispatch( ['-h'], null );
  } );

  describe('configuration', function() {
    let serveSpy = sinon.stub().returnsArg(0);
    let serveRevert;

    before(function() {
      serveRevert = dispatch.__set__('serve', serveSpy);
    });

    it('should pass on any CLI configuration', function() {
      let configuration = dispatch(['api_spec.json', '--example=disabled', '--no-ui', '--foo', 'bar'], null);
      assert.deepStrictEqual(configuration, {'_': ['api_spec.json'], 'example': 'disabled', 'ui': false, 'foo': 'bar'});
    });

    describe('file', function() {
      it('should read the specified configuration file', function() {
        let configuration = dispatch(['api_spec.json', '--config=test/config.yaml'], null);
        assert.deepStrictEqual(configuration, {
          '_': ['api_spec.json'], 'config': 'test/config.yaml', 'example': 'enabled', 'bar': true, 'foo': 'foobar',
        });
      });
      it('should not overwrite CLI arguments', function() {
        let configuration = dispatch(['api_spec.json', '--example=disabled', '--no-ui', '--foo', 'bar', '--config=test/config.yaml'], null);
        assert.deepStrictEqual(configuration, {
          '_': ['api_spec.json'], 'config': 'test/config.yaml', 'example': 'disabled', 'ui': false, 'foo': 'bar', 'bar': true,
        });
      });
    });

    after(function() {
      serveRevert();
    });
  });
} );
