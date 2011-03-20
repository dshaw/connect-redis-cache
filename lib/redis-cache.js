
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
  this.maxAge = 'number' == typeof options.maxAge
              ? options.maxAge
              : oneHour * 1000;
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
  if (!cacheable) return fn();
  this.client.get(key, function(err, data){
    try {
      if (!data) return fn();
      fn(null, JSON.parse(data.toString()));
    } catch (err) {
      fn && fn(err);
    } 
  });
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
 * @param {String} resourceId
 * @param {Object} data
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

RedisCache.prototype.setex = function(resourceId, ttl, data, fn){
  try {
    ttl = 'number' == typeof ttl ? ttl : 0;
    var data = JSON.stringify(data);
    this.client.setex(resourceId, ttl, data, function() {
      fn && fn.apply(this, arguments);
    });
  } catch (err) {
    fn && fn(err);
  }
};

/**
 * Destroy the data associated with the given `resourceId`.
 *
 * @param {String} resourceId
 * @api public
 */

RedisCache.prototype.destroy = function(resourceId, fn){
  this.client.del(resourceId, fn);
};

/**
 * Fetch number of cached data pairs.
 *
 * @param {Function} fn
 * @api public
 */

RedisCache.prototype.length = function(fn){
  this.client.dbsize(fn);
};

/**
 * Clear all cached data.
 *
 * @param {Function} fn
 * @api public
 */

RedisCache.prototype.clear = function(fn){
  this.client.flushdb(fn);
};
