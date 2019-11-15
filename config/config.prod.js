const path = require('path');

const redisStore = require('cache-manager-ioredis');

const rootPath = path.resolve(__dirname, '..');

const config = {
  port: 7090,
  sequelize: {
    dialect: 'mysql',
    database: 'tcc-service',
    host: 'xxxxx',
    port: 3306,
    username: 'root',
    password: 'pwd',
  },
  bull: {
    prefix: 'tcc',
    name: 'tcc-service',
    redis: {
      host: 'xxx',
      port: 6379,
      password: 'pwd',
      db: 11,
    },
    defaultJobOptions: {
      removeOnComplete: true,
    },
  },
  log4js: {
    defaultCategory: 'app',
    appenders: {
      default: { type: 'console' },
      app: { type: 'file', filename: path.join(rootPath, '/logs/app.log') },
    },
    categories: {
      default: { appenders: ['default'], level: 'ALL' },
      app: { appenders: ['app'], level: 'warn' },
    },
    replaceConsole: true,
    disableClustering: true,
  },
  cache: {
    default: 'redis',
    stores: {
      redis: {
        driver: redisStore,
        host: 'xxxx',
        port: 6379,
        password: 'xxxx',
        db: 12,
        ttl: 600, // 十分钟
        valid: _ => _ !== null,
        keyPrefix: 'tcc-cache:',
      },
    },
  },
};


module.exports = config;
