const moment = require('moment');
const Promise = require('bluebird');

class RestartTranSchedule {
  static schedule() {
    return {
      cron: '* */5 * * * *', // 5 分钟间隔
      // cron: '*/10 * * * * *', // 10s 间隔
    };
  }

  static async subscribe(app) {
    const { models, core } = app;
    const { queue, logger } = core;

    const { TransactionInstance } = models;

    const list = await TransactionInstance.findAll({
      where: {
        status: TransactionInstance.STATUS_RUNNING,
      },
    });


    // 间隔超过3分钟
    const beforeLastUpdateMoment = moment().subtract(3, 'm');

    const filterList = list.filter(item => beforeLastUpdateMoment.isAfter(item.updatedAt));

    await Promise.each(filterList, async (item) => {
      const queueData = {
        id: item.id,
      };

      logger.info(`tranId ${item.id} restart`);

      return queue.add('running', queueData);
    });
  }
}

module.exports = RestartTranSchedule;
