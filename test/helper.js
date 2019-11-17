// const assert = require('assert');
const thrift = require('thrift');
const TranTcc = require('../thriftExport/gen/TranTcc');
const rpcThrift = require('../thriftExport/rpc');
const httpThrift = require('../thriftExport/http');
const app = require('../app');

const rpcServer = rpcThrift.server;
const httpServer = httpThrift.server;

const TEST_RPC_PORT = 9090;
const TEST_HTTP_PORT = 9091;

const TEST_HOST = 'localhost';

before(async () => {
  await rpcServer.listen(TEST_RPC_PORT, () => {
    console.log('start rpc server');
  });

  await httpServer.listen(TEST_HTTP_PORT, () => {
    console.log('start http server');
  });


  // const options = {
  //   path: '/services',
  // };

  const options = {
    transport: thrift.TBufferedTransport,
    protocol: thrift.TJSONProtocol,
  };

  // const connection = thrift.createConnection('127.0.0.1', TEST_RPC_PORT, options);
  const rpcConnection = thrift.createConnection(TEST_HOST, TEST_RPC_PORT, options);

  rpcConnection.on('error', (err) => {
    console.error(err);
  });

  rpcConnection.on('close', (err) => {
    console.error(err);
  });

  const clientTransTcc = await thrift.createClient(TranTcc, rpcConnection);


  /**
   * ====================
   * http client start
   * ====================
   */
  const httpOptions = {
    ...options,
    path: '/tcc',
    headers: { Connection: 'close' },
    https: false,
  };

  const httpConnection = await thrift.createHttpConnection(TEST_HOST, TEST_HTTP_PORT, httpOptions);
  httpConnection.on('error', (err) => {
    console.error(err);
  });

  httpConnection.on('close', (err) => {
    console.error(err);
  });

  const httpTranTccClient = await thrift.createHttpClient(TranTcc, httpConnection);
  /**
   * ====================
   * http client end
   * ====================
   */

  global.clients = {
    TransTcc: clientTransTcc,
    httpTranTcc: httpTranTccClient,
  };


  global.connection = rpcConnection;
  global.service = rpcServer;
  global.app = app;
});


after(() => {
  global.connection.end();
  rpcServer.close();
  httpServer.close();
  process.exit(0);
});
