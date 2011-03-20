
/**
 * Module dependencies.
 */

var assert = require('assert')
  , connect = require('connect')
  , cache = require('./')
  , http = require('http');


/**
 * Server
 */

var server = connect.createServer(cache());

server.use('/', function(req, res) {
  var value = { value: 1};

  req.cache.set('key', value, { maxAge: -1 }, function(err, ok) {
    assert.ok(!err, '#set() got an error');
    assert.ok(ok, '#set() is not ok');
    console.log(err, ok);

    req.cache.get('key', true, function(err, data) {
      assert.ok(!err, '#get() got an error');
      assert.deepEqual(value, data);
      console.dir(data);

      res.end(JSON.stringify(data));
    });
  });

  res.end('done');
});

server.listen(3000);
console.log('Connect server listening on port 3000');
