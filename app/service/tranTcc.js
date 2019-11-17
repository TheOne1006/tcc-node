
const Promise = require('bluebird');
const debug = require('debug')('app:service:tranTcc');

const ActionProgress = require('../help/ActionProgress');

module.exports = (services, config, models, core) => {
  const {
    Action,
    ActionLog,
    Project,
    Process,
    TransactionInstance,
  } = models;

  /**
   * @class TranTcc
   * 对外支持的 Tcc 的相关服务
   */
  class TranTcc {
    /**
     * TranTcc.createInstance
     * 创建一个事务实例
     *
     * @static
     * @param {string} projectKey 项目的key
     * @param {string} processKey 进程的key
     * @param {string} messageId  事务的唯一id
     * @param {object} payload    任务相关的参数
     *
     * @return {object} 事务实例
     */
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
     * TranTcc.groupActionsExec
     * 执行一些 Action 的集合并获取结果
     *
     * @static
     * @param {Array.<object>} actions - 集合 [{currentAttemptTime: 当前尝试次数, id: actionId}]
     * @param {Object} payload         - 请求载体
     * @param {string} messageId       - 消息id/事务唯一标识
     * @param {number} projectId       - 项目id
     * @param {number} proccessId      - 流程程id
     *
     * @returns {Array.<object>} 处理结果集 [{id, success, currentAttemptTime }] 处理结果
     */
    static async groupActionsExec(
      actions,
      payload,
      messageId,
      projectId,
      proccessId,
    ) {
      const promiseActionLogs = actions.map((actionItem) => {
        const { currentAttemptTime, id: actionId } = actionItem;
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
     * TranTcc.singleActionExec
     * 执行某个独立的action
     *
     * @static
     * @param {number} actionId - action id
     * @param {json} payload 载体
     * @param {string} messageId 消息id
     * @param {number} projectId 项目id
     * @param {number} proccessId 过程id
     * @param {number} currentAttemptTime 当前执行次数
     * @returns {Object} actionLogInstance actionLog的实例
     */
    static async singleActionExec(
      actionId,
      payload = {},
      messageId = '',
      projectId = 0,
      proccessId = 0,
      currentAttemptTime = 0,
    ) {
      try {
        let resultData;
        const actionInstance = await Action.findByPkOrThrow(actionId);

        // 发送成功
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
      } catch (error) {
        // 记录异常
        const actionLogInput = {
          messageId,
          projectId,
          proccessId,
          actionId,
          isSuccess: false,
          payload,
          errorMessage: error.toString(),
          currentAttemptTime: currentAttemptTime + 1,
        };

        const log = await ActionLog.create(actionLogInput);
        return log;
      }
    }

    /**
     * TranTcc.try2NextStep
     * 尝试进入下一个步骤, 当前步骤的所有状态满足特定条件
     *
     * @static
     * @param {number} tranId - 事务的实例id
     * @return {Object} 事务实例
     */
    static async try2NextStep(tranId) {
      const instance = await TransactionInstance.findByPkOrThrow(tranId);
      // 校验步骤状态
      const {
        // step,
        needExecActionsInfo,
      } = instance.getStepNeedExec();

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
