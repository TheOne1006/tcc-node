const path = require('path');

const rootPath = path.resolve(__dirname, '..');

const config = {
  rpcPort: 7090,
  httpPort: 9091,
  vmCacheLength: 30,
  sequelize: {
    dialect: 'mysql',
    database: 'trans-tcc-dev',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
  },
  bull: {
    prefix: 'tcc',
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
  log4js: {
    defaultCategory: 'default',
    // defaultCategory: 'app',
    appenders: {
      default: { type: 'console' },
      app: { type: 'file', filename: path.join(rootPath, '/logs/app.log') },
    },
    categories: {
      default: { appenders: ['default'], level: 'ALL' },
      app: { appenders: ['app'], level: 'ALL' },
    },
    replaceConsole: true,
    disableClustering: true,
    // levels: {
    //   log_file: 'ALL',
    //   console: 'ALL',
    //   log_date: 'ALL',
    // },
  },
  cache: {
    default: 'memory',
    stores: {
      memory: {
        driver: 'memory',
        max: 100,
        ttl: 200,
      },
    },
  },
};


module.exports = config;
