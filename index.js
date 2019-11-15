const nodeSchedule = require('node-schedule');

let thriftService = require('./thriftExport/rpc');

const config = require('./config');

if (process.env.SERVER_TYPE === 'http') {
  // eslint-disable-next-line global-require
  thriftService = require('./thriftExport/http');
}

const port = (process.env.SERVER_TYPE === 'http') ? config.rpcPort : config.httpPort;

const exportService = thriftService.server;
const { app } = thriftService;


const { core: { queue, logger }, services, schedules } = app;

// 清空队列
// queue.clean(0, 'failed');
// queue.clean(0, 'wait');
// queue.clean(0, 'delayed');
// queue.clean(0, 'completed');

// 队列 开启
if (process.env.WITH_QUEUE) {
  logger.info(`queue start, at ${new Date()}, process.pid: ${process.pid}`);

  queue.process('init', 1, services.ProcessJob.init);
  queue.process('running', 1, services.ProcessJob.running);
}


// server 服务
if (process.env.WITH_SERVER) {
  exportService.listen(port, () => {
    const serverType = process.env.SERVER_TYPE || 'rpc';
    logger.info(`${serverType} service start at ${port}, at ${new Date()}, process.pid: ${process.pid}`);
  });
}

// server 计划任务
if (process.env.WITH_SCHEDULE) {
  logger.info(`schedule start, at ${new Date()}, process.pid: ${process.pid}`);

  const keys = Object.keys(schedules);
  logger.info(keys);

  for (let index = 0; index < keys.length; index += 1) {
    const currentKey = keys[index];
    const currentSchedule = schedules[currentKey];


    const corn = currentSchedule.schedule();
    nodeSchedule.scheduleJob(corn, () => currentSchedule.subscribe(app));
  }
}
