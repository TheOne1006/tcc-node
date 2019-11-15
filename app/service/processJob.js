
// const Promise = require('bluebird');
const debug = require('debug')('app:service:processJob');

module.exports = (services, config, models, core) => {
  const {
    TransactionInstance,
  } = models;
  class ProcessJob {
    static async init(job) {
      const { data } = job;
      const tranId = data.id;

      try {
        const tranIns = await TransactionInstance.findByPk(tranId);

        if (!tranIns || tranIns.status !== TransactionInstance.STATUS_INIT) {
          throw new Error('未找到实例, 或者实例状态错误');
        }


        const updateData = {
          status: TransactionInstance.STATUS_RUNNING,
          step: TransactionInstance.STEP_TRYING,
        };

        const queueData = {
          id: tranIns.id,
        };

        await core.queue.add('running', queueData, tranIns.spacingMilliSeconds);
        await tranIns.update(updateData);
        debug(`${tranId} init success`);
        return 'ok';
      } catch (error) {
        debug(`${tranId} init error`);
        return Promise.reject(error);
      }
    }

    static async running(job) {
      const { data } = job;
      const tranId = data && data.id;

      try {
        // 防止重复执行
        const runningCache = `system:running-${tranId}`;
        const ttl = 10000;

        const hasExpireKey = await core.cache.has(runningCache);
        if (hasExpireKey) {
          throw new Error('还在执行中重复执行');
        }

        await core.cache.set(runningCache, 1, ttl);

        const tranIns = await TransactionInstance.findByPk(tranId);

        if (!tranIns || tranIns.status !== TransactionInstance.STATUS_RUNNING) {
          throw new Error('未找到实例, 或者实例状态错误');
        }

        const changeTranIns = await services.TranTcc.try2NextStep(tranId);

        // 再次放回执行队列中
        if (changeTranIns.status === TransactionInstance.STATUS_RUNNING) {
          // 几秒种后再次执行
          const queueData = {
            id: tranId,
          };

          await core.cache.del(runningCache);
          await core.queue.add('running', queueData, tranIns.spacingMilliSeconds);
        }
        return 'ok';
      } catch (error) {
        debug(`${tranId} running error`);
        return Promise.reject(error);
      }
    }
  }

  return ProcessJob;
};
