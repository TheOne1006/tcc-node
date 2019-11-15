const defaultConfig = require('./config.default');
const devConfig = require('./config.devploment');
const testConfig = require('./config.test');
const prodConfig = require('./config.prod');

const DEVPLOMENT = 'devploment';
const TEST = 'test';
const PROD = 'production';

let targetConfig = {};

switch (process.env.NODE_ENV) {
case DEVPLOMENT:
  targetConfig = devConfig;
  break;
case TEST:
  targetConfig = testConfig;
  break;
case PROD:
  targetConfig = prodConfig;
  break;
default:
  break;
}

const config = {
  ...defaultConfig,
  ...targetConfig,
};

module.exports = config;
