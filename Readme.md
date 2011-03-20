
# Redis Cache

redis-cache is a high speed Redis cache middleware backed by [node_redis](http://github.com/mranney/node_redis).
Requires redis >= `1.3.10` for the _SETEX_ command.

## Installation

via npm:

	  $ npm install .

## Options

  - `host` Redis server hostname
  - `port` Redis server portno
  - `db` Database index to use
  - ...    Remaining options passed to the redis `createClient()` method.

## Example

    var cache = require('redis-cache');

    connect.createServer(cache());
