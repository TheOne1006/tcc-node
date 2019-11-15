const nock = require('nock');

const { assert } = require('chai');

const transactionInstances = require('../../mockData/default.transaction-instance');
const actions = require('../../mockData/default.action');

describe('test/app/service/processJob.test.js', () => {
  let queue;
  let TransactionInstanceModel;

  before(async () => {
    const { queue: coreQueue } = global.app.core;
    queue = coreQueue;
    TransactionInstanceModel = global.app.models.TransactionInstance;
    await queue.clean(0, 'failed');
    await queue.clean(0, 'wait');
    await queue.clean(0, 'delayed');

    await TransactionInstanceModel.sync({ force: true });
    await TransactionInstanceModel.bulkCreate(transactionInstances);
    await global.app.models.Action.sync({ force: true });
    await global.app.models.Action.bulkCreate(actions);
  });

  describe('ProcessJob.init', () => {
    it('ProcessJob init with error', async () => {
      const job = { data: { err: 1 } };
      let err;
      try {
        await global.app.services.ProcessJob.init(job);
      } catch (error) {
        err = error;
      }


      assert.equal(err.message, '未找到实例, 或者实例状态错误');
    });

    it('ProcessJob init success and change status', async () => {
      const job = { data: { id: 31 } };

      const instancePre = await TransactionInstanceModel.findByPk(31);

      await global.app.services.ProcessJob.init(job);

      const instanceAfter = await TransactionInstanceModel.findByPk(31);

      const jobs = await global.app.core.queue.getJobs('delayed');

      assert.equal(jobs.length, 1);
      assert.equal(instancePre.status, 'init');
      assert.equal(instanceAfter.status, 'running');
    });
  });
  describe('ProcessJob.running', () => {
    it('ProcessJob running with error with has cache', async () => {
      const job = { data: { id: 1 } };
      const runningCache = 'system:running-1';
      const ttl = 10;

      await global.app.core.cache.set(runningCache, 1, ttl);

      let err;
      try {
        await global.app.services.ProcessJob.running(job);
      } catch (error) {
        err = error;
      }


      assert.equal(err.message, '还在执行中重复执行');
    });

    it('ProcessJob running with not found instance', async () => {
      const job = { data: { id: 100000 } };

      let err;
      try {
        await global.app.services.ProcessJob.running(job);
      } catch (error) {
        err = error;
      }

      assert.equal(err.message, '未找到实例, 或者实例状态错误');
    });

    it('ProcessJob running  with status error', async () => {
      const job = { data: { id: 33 } };

      let err;
      try {
        await global.app.services.ProcessJob.running(job);
      } catch (error) {
        err = error;
      }

      assert.equal(err.message, '未找到实例, 或者实例状态错误');
    });

    it('ProcessJob running success once try', async () => {
      const runningCache = 'system:running-34';
      const job = { data: { id: 34 } };

      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-34', t: '124', c: '234' })
        .reply(200, {
          _c: 'success',
        });

      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-34', t: '124', c: '234' })
        .reply(200, {
          _c: 'success2',
        });

      nock('http://test-try3.com')
        .post('/', { messageId: 'message-id-34', t: '124' })
        .reply(200, {
          _c: 'success3',
        });


      const instancePre = await TransactionInstanceModel.findByPk(34);

      await global.app.services.ProcessJob.running(job);
      const instanceAfter = await TransactionInstanceModel.findByPk(34);

      const hasCacheRunning = await global.app.core.cache.get(runningCache);

      const jobs = await global.app.core.queue.getJobs('delayed');

      const lastJob = jobs[0];

      assert.equal(jobs.length, 2);
      assert.equal(lastJob.data.id, 34);

      assert.equal(!hasCacheRunning, true);

      assert.equal(instancePre.status, 'running');
      assert.equal(instancePre.step, 'trying');


      assert.equal(instanceAfter.status, 'running');
      assert.equal(instanceAfter.step, 'confirming');
    });
  });
});
