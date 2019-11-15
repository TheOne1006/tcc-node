const assert = require('assert');

describe('test with ping', () => {
  let testClient;
  let httpTranTccClient;
  // let app;
  before(async () => {
    testClient = global.clients.TransTcc;
    httpTranTccClient = global.clients.httpTranTcc;
  });

  describe('rpc ping', () => {
    it('ping', async () => {
      // console.log('testClient');
      // console.log(testClient);
      const result = await testClient.ping();
      assert(result === 1);
    });
  });

  describe('http ping', () => {
    it('ping', async () => {
      const result = await httpTranTccClient.ping();
      assert(result === 1);
    });
  });
});
