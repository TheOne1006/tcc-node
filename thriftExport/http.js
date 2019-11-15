
const thrift = require('thrift');
const TransTcc = require('./gen/TranTcc');

const app = require('../app');
const tccTypes = require('./gen/tcc_types');

const TransTccHandlerFactory = require('./handlers/tranTcc');

// build handler
const TransTccHandler = TransTccHandlerFactory(app, tccTypes);


// http 支持
const options = {
  transport: thrift.TBufferedTransport,
  protocol: thrift.TJSONProtocol,
  // useCORS: true,
  cors: {
    '*': true,
  },
  handler: TransTccHandler,
  processor: TransTcc,
};

const serverOpt = {
  services: {
    '/tcc': options,
  },
};

const server = thrift.createWebServer(serverOpt);

module.exports = { server, app };
