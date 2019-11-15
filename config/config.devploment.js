
const redisStore = require('cache-manager-ioredis');

const config = {
  port: 9099,
  bull: {
    prefix: 'tcc-dev',
    name: 'system',
    redis: {
      host: 'localhost',
      port: 6379,
      db: 3,
    },
    defaultJobOptions: {
      removeOnComplete: true,
    },
  },
  cache: {
    default: 'redis',
    stores: {
      memory: {
        driver: 'memory',
        max: 100,
        ttl: 200,
      },
      redis: {
        driver: redisStore,
        host: 'localhost',
        port: 6379,
        db: 5,
        ttl: 600, // 十分钟
        valid: _ => _ !== null,
        keyPrefix: 'cache:',
      },
    },
  },
};


module.exports = config;
