
const thrift = require('thrift');
const TransTcc = require('./gen/TranTcc');

const app = require('../app');
const tccTypes = require('./gen/tcc_types');

const TransTccHandlerFactory = require('./handlers/tranTcc');

// Thrift协议实现目前有二进制协议（TBinaryProtocol），
// 紧凑型二进制协议（TCompactProtocol）和Json协议（TJSONProtocol）
const options = {
  transport: thrift.TBufferedTransport,
  protocol: thrift.TJSONProtocol,
  // useCORS: true,
  // cors: {
  //   '*': true,
  // },
};


// build handler
const TransTccHandler = TransTccHandlerFactory(app, tccTypes);


// const processor = new thrift.MultiplexedProcessor();
// processor.registerProcessor(
//   'TranTcc',
//   new TransTcc.Processor(TransTccHandler),
// );

// processor.registerProcessor(
//   'SecondService',
//   new TransTccService.Processor(TransTccHandler),
// );

const server = thrift.createServer(TransTcc, TransTccHandler, options);

module.exports = { server, app };
