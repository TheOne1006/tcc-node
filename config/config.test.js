
const debug = require('debug')('app:sequelize');

const config = {
  sequelize: {
    dialect: 'mysql',
    database: 'trans_tcc_test',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    logging: (sql) => { debug(sql); },
    // logging: function (sql) {
    //   // logger为log4js的Logger实例
    //   logger.info(sql);
    // }
  },
  bull: {
    prefix: 'tcc-test',
    name: 'system',
    redis: {
      host: 'localhost',
      port: 6379,
      db: 5,
    },
    defaultJobOptions: {
      removeOnComplete: true,
    },
  },
};


module.exports = config;
