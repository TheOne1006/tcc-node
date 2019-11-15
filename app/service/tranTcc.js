
const Promise = require('bluebird');
const debug = require('debug')('app:service:tranTcc');

const ActionProgress = require('../help/ActionProgress');
// const _ = require('lodash');


module.exports = (services, config, models, core) => {
  const {
    Action,
    ActionLog,
    Project,
    Process,
    TransactionInstance,
  } = models;
  class TranTcc {
    static async createInstance(projectKey, processKey, messageId, payload) {
      const projectInstance = await Project.findOneOrThrow({
        where: {
          key: projectKey,
        },
      });

      const processInstance = await Process.findOneOrThrow({
        where: {
          key: processKey,
        },
      });
      // 初始化数据 maxAttemptTime
      let tryActionsInfo = await Promise.map(processInstance.tryIds, async (itemId) => {
        const actionInstance = await Action.findByPkOrThrow(itemId);
        return actionInstance && new ActionProgress(actionInstance);
      });
      let confirmActionsInfo = await Promise.map(processInstance.confirmIds, async (itemId) => {
        const actionInstance = await Action.findByPkOrThrow(itemId);
        return actionInstance && new ActionProgress(actionInstance);
      });
      let cancelActionsInfo = await Promise.map(processInstance.cancelIds, async (itemId) => {
        const actionInstance = await Action.findByPkOrThrow(itemId);
        return actionInstance && new ActionProgress(actionInstance);
      });

      tryActionsInfo = tryActionsInfo.filter(item => item);
      confirmActionsInfo = confirmActionsInfo.filter(item => item);
      cancelActionsInfo = cancelActionsInfo.filter(item => item);

      const input = {
        title: `${projectInstance.name}-${processInstance.name}`,
        messageId,
        projectId: projectInstance.id,
        proccessId: processInstance.id,
        desc: '',
        status: TransactionInstance.STATUS_INIT,
        log: [],
        payload,
        tryIds: processInstance.tryIds,
        confirmIds: processInstance.confirmIds,
        cancelIds: processInstance.cancelIds,
        tryActionsInfo,
        confirmActionsInfo,
        cancelActionsInfo,
        spacingMilliSeconds: processInstance.spacingMilliSeconds,
      };

      const instance = await TransactionInstance.create(input);

      await core.queue.add('init', { id: instance.id });

      return instance;
    }

    /**
     * 执行 某个 action
     * @param {number} actionId action id
     * @param {json} payload payload
     * @param {string} messageId 消息id
     * @param {number} projectId 项目id
     * @param {number} proccessId 过程id
     * @param {number} currentAttemptTime 当前执行次数
     */
    static async singleActionExec(
      actionId,
      payload,
      messageId,
      projectId,
      proccessId,
      currentAttemptTime,
    ) {
      const actionInstance = await Action.findByPkOrThrow(actionId);

      let resultData;

      switch (actionInstance.sendType) {
      case Action.SEND_TYPE_HTTP_REQUEST:
        resultData = await actionInstance.sendHttp(messageId, payload);
        break;
      default:
        break;
      }

      const isMatch = await actionInstance.isMatchResult(resultData);

      const actionLogInput = {
        messageId,
        projectId,
        proccessId,
        actionId,
        isSuccess: resultData && isMatch,
        payload,
        repData: resultData,
        currentAttemptTime: currentAttemptTime + 1,
      };

      const log = await ActionLog.create(actionLogInput);

      return log;
    }

    /**
     * next
     * @param {*} actions 行为
     * @param {*} payload
     * @param {*} messageId 消息id
     * @param {*} projectId
     * @param {*} proccessId
     *
     * @return [{id, success, currentAttemptTime }] 处理结果
     */
    static async groupActionsExec(
      actions,
      payload,
      messageId,
      projectId,
      proccessId,
    ) {
      const promiseActionLogs = actions.map((actionItem) => {
        const { currentAttemptTime } = actionItem;
        const actionId = actionItem.id;
        return TranTcc.singleActionExec(
          actionId,
          payload,
          messageId,
          projectId,
          proccessId,
          currentAttemptTime,
        );
      });

      const actionLogs = await Promise.all(promiseActionLogs);

      const resultInfo = actionLogs.map(item => ({
        id: item.actionId,
        success: item.isSuccess,
        currentAttemptTime: item.currentAttemptTime,
      }));

      return resultInfo;
    }

    /**
     * 尝试进入下一个步骤
     * @param {number} tranId 实例id
     */
    static async try2NextStep(tranId) {
      const instance = await TransactionInstance.findByPkOrThrow(tranId);
      // 校验步骤状态
      const {
        // step,
        needExecActionsInfo,
      } = instance.exportCurrentStep();

      debug('needExecActionsInfo :%o', needExecActionsInfo);

      const {
        projectId,
        payload,
        proccessId,
        messageId,
      } = instance;

      const resultInfo = await TranTcc.groupActionsExec(
        needExecActionsInfo,
        payload,
        messageId,
        projectId,
        proccessId,
      );

      debug('resultInfo :%o', resultInfo);

      // updateData 更新数据
      const updateData = await instance.createGoNextData(resultInfo);

      debug('updateData :%o', updateData);
      await instance.update(updateData);

      return instance;
    }
  }

  return TranTcc;
};
