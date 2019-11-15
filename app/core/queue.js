'use strict';


class SystemQueue {
  constructor(queueObj) {
    this.queue = queueObj;
  }

  // abstract
  async add(action, jsonData, delay) {
    console.log(action, jsonData, delay);
    throw new Error('请实现加入队列方法');
  }

  async process(action, concurrency, processor) {
    console.log(processor);
    throw new Error('请实现队列process方法');
  }

  async empty() {
    throw new Error('empty');
  }

  async clean() {
    throw new Error('clean');
  }

  async getJobFromId(jobId) {
    console.log(jobId);
    throw new Error('getJobFromId');
  }

  async getJobs(types) {
    console.log(types);
    throw new Error('getJobs');
  }
}

/**
 * 实现系统队列
 */
class BullSystemQueue extends SystemQueue {
  async add(action, jsonData, delay) {
    const options = {
      delay: delay || 0,
    };
    return this.queue.add(action, jsonData, options);
  }

  process(action, concurrency, processor) {
    this.queue.process(action, concurrency, processor);
  }

  async empty() {
    return this.queue.empty();
  }

  async clean(grace, status, limit) {
    return this.queue.clean(grace, status, limit);
  }

  async getJobFromId(jobId) {
    return this.queue.getJob(jobId);
  }

  async getJobs(types) {
    return this.queue.getJobs(types);
  }
}

module.exports = (config, core) => {
  // 默认使用 bull
  const originQueue = core.bull;

  // 延迟加载
  core.queue = new BullSystemQueue(originQueue);
};
