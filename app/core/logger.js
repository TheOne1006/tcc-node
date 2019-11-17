'use strict';

const log4js = require('log4js');

function createLogger(config) {
  const logConfig = config;
  const { defaultCategory } = logConfig;

  log4js.configure(logConfig);

  return log4js.getLogger(defaultCategory);
}

module.exports = (config, core) => {
  if (config.log4js) {
    core.logger = createLogger(config.log4js, core);
  }
};
