
const { assert } = require('chai');

// const ttypes = require('../../../gen/tutorial_types');

const transactionInstances = require('../../mockData/default.transaction-instance');

describe('test/app/schedule/restartTran.test.js', () => {
  before(async () => {
    await global.app.models.TransactionInstance.sync({ force: true });
    await global.app.models.TransactionInstance.bulkCreate(transactionInstances);

    await global.app.core.queue.clean(0, 'failed');
    await global.app.core.queue.clean(0, 'wait');
    await global.app.core.queue.clean(0, 'delayed');
    await global.app.core.queue.clean(0, 'completed');
  });

  describe('get schedule timer', () => {
    it('schedule', async () => {
      const actual = global.app.schedules.RestartTranSchedule.schedule();
      const expected = {
        cron: '* */5 * * * *', // 5 分钟间隔
      };

      assert.deepEqual(actual, expected);
    });

    it('subscribe', async () => {
      await global.app.schedules.RestartTranSchedule.subscribe(global.app);
      const jobs = await global.app.core.queue.getJobs();
      assert(jobs.length === 2);
    });
  });
});
