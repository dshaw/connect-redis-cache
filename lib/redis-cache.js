
/*!
 * Redis Cache
 * Copyright(c) 2011 Daniel D. Shaw <daniel.shaw@dshaw.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var redis = require('redis');


/**
 * Connect/Express Middleware
 */

module.exports = function(options) {
  options = options || {};
  var cache = options.cache || new RedisCache(options);
  console.warn('Setup cache.');

  return function(req, res, next) {
    req.cache = cache;
    next();
  }
};


/**
 * Initialize RedisCache with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

function RedisCache(options) {
  options = options || {};
  this.client = new redis.createClient(options.port, options.host, options);
  if (options.db) {
    var self = this;
    self.client.on('connect', function() {
      self.client.select(options.db);
    });
  }
}

/**
 * Attempt to fetch data by the given `key` if the app considers it cacheable.
 *
 * @param {String} key
 * @param {Boolean} cacheable
 * @param {Function} fn
 * @api public
 */

RedisCache.prototype.get = function(key, cacheable, fn){
  try {
    if (!cacheable) return fn();
    if (!this.client.connected) return fn(new Error('Redis server not connected.'));
    this.client.get(key, function(err, data) {
      (err)
        ? fn(err)
        : fn(null, (data) ? JSON.parse(data.toString()) : data);
    });
  } catch (err) {
    fn && fn(err);
  }
};

/**
 * Commit the given object associated with the given `key`.
 *
 * @param {String} key
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

RedisCache.prototype.set = function(key, data, fn){
  try {
    if (!this.client.connected) return fn(new Error('Redis server not connected.'));
    data = JSON.stringify(data);
    this.client.set(key, data, function() {
      fn && fn.apply(this, arguments);
    });
  } catch (err) {
    fn && fn(err);
  }
};

/**
 * Commit the given object associated with the given `key` for a time period.
 *
 * @param {String} key
 * @param {Object} data
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

RedisCache.prototype.setex = function(key, ttl, data, fn){
  try {
    if (!this.client.connected) return fn(new Error('Redis server not connected.'));
    ttl = 'number' == typeof ttl ? ttl : 0;
    var data = JSON.stringify(data);
    this.client.setex(key, ttl, data, function() {
      fn && fn.apply(this, arguments);
    });
  } catch (err) {
    fn && fn(err);
  }
};

/**
 * Destroy the data associated with the given `keys`.
 *
 * @param {String|Array} key(s)
 * @api public
 */

RedisCache.prototype.clear = function(keys, fn) {
  if (!this.client.connected) return fn(new Error('Redis server not connected.'));
  if (!Array.isArray(keys))
    keys = [keys];
  keys.forEach(function(key) {
    this.client.del(key, fn);
  })
};

/**
 * Fetch number of cached data pairs.
 *
 * @param {Function} fn
 * @api public
 */

RedisCache.prototype.size = function(fn) {
  if (!this.client.connected) return fn(new Error('Redis server not connected.'));
  this.client.dbsize(fn);
};

/**
 * Clear all cached data.
 *
 * @param {Function} fn
 * @api public
 */

RedisCache.prototype.flush = function(fn) {
  if (!this.client.connected) return fn(new Error('Redis server not connected.'));
  this.client.flushdb();
  fn && fn();
};
