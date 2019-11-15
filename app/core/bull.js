'use strict';

const assert = require('assert');
const Queue = require('bull');

function createQueue(config) {
  const { name, redis } = config;
  assert(name, '[bull] name is required on config');
  assert(
    redis && redis.host && redis.port,
    '[bull] host and port of redis are required on config',
  );

  const queue = new Queue(name, config);

  /* istanbul ignore next */
  queue.on('error', (error) => {
    // TODO:  log4js
    console.error(error);
    process.exit(1);
  });

  return queue;
}


module.exports = (config, core) => {
  if (config.bull) {
    core.bull = createQueue(config.bull, core);
  }
};
