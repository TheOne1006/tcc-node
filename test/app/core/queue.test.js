const Promise = require('bluebird');

const { assert } = require('chai');

// const ttypes = require('../../../gen/tutorial_types');

describe('test/app/core/queue.test.js', () => {
  let queue;
  before(async () => {
    const { queue: coreQueue } = global.app.core;
    queue = coreQueue;
    queue.clean(0, 'failed');
    queue.clean(0, 'wait');
  });

  describe('BullSystemQueue', () => {
    // todo more
    it('BullSystemQueue add', async () => {
      const job = await queue.add('test', { c: 2 });

      const actual = job.data;
      const expected = {
        c: 2,
      };

      const jobFromQueue = await queue.getJobFromId(job.id);

      assert.deepEqual(actual, expected);
      assert.deepEqual(jobFromQueue.data, expected);
    });

    it('BullSystemQueue process', async () => {
      await queue.add('process-test', { c: 2 });
      await queue.add('process-test', { c: 3 });
      let count = 0;
      queue.process('process-test', 1, async (job) => {
        const { data } = job;
        count += data.c;
        return count;
      });

      await new Promise((reslove) => {
        setInterval(() => {
          reslove('ok');
        }, 100);
      });

      assert(count, 5);
    });


    it('BullSystemQueue process', async () => {
      await queue.add('process-test-delay', { c: 'foo' }, 500);
      await queue.add('process-test-delay', { c: 'bar' }, 300);
      let cStr = '';
      queue.process('process-test-delay', 1, async (job) => {
        const { data } = job;
        cStr += data.c;
        return cStr;
      });

      await new Promise((reslove) => {
        setInterval(() => {
          reslove('ok');
        }, 1300);
      });


      assert(cStr, 'barfoo');
    });
  });
});
