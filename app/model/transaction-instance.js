'use strict';

const _ = require('lodash');
const debug = require('debug')('app:model:transaction-instance');

const ActionProgress = require('../help/ActionProgress');

const STATUS_INIT = 'init';
const STATUS_RUNNING = 'running';
const STATUS_COMPLETED = 'completed';
const STATUS_ABNORMAL = 'abnormal';

const STEP_TRYING = 'trying';
const STEP_CONFIRMING = 'confirming';
const STEP_CANCELLING = 'cancelling';

module.exports = (sequelize, DataTypes, BaseModel) => {
  /**
   * @class model TransactionInstance
   * @extends BaseModel
   */
  class TransactionInstance extends BaseModel {
    /**
     * 实例当前步骤和相关信息的集合
     * @typedef  {Object}  getCurrentStepInfoReturn
     * @property {String}         currentStep                 - 当前实例的步骤
     * @property {Array.<number>} actionIds                   - [当前action的id]
     * @property {Array.<ActionProgress>}  currentActionsInfo - [action进度总结]
     */

    /**
     * 获取实例的当前步骤 和 相关信息集合
     * @return {getCurrentStepInfoReturn}
     */
    getCurrentStepInfo() {
      const instance = this;

      const {
        step,
        tryIds,
        confirmIds,
        cancelIds,
        tryActionsInfo,
        confirmActionsInfo,
        cancelActionsInfo,
      } = instance;

      let actionIds = [];
      let actionsInfo = [];

      switch (step) {
      case STEP_TRYING:
        actionIds = tryIds;
        actionsInfo = tryActionsInfo;
        break;
      case STEP_CONFIRMING:
        actionIds = confirmIds;
        actionsInfo = confirmActionsInfo;
        break;
      case STEP_CANCELLING:
        actionIds = cancelIds;
        actionsInfo = cancelActionsInfo;
        break;
      default:
        break;
      }
      const exportInfo = {
        currentStep: step,
        currentActionIds: actionIds,
        currentActionsInfo: actionsInfo,
      };

      debug('exportInfo :%o', exportInfo);

      return exportInfo;
    }

    /**
     * 实例当前步骤和相关信息的集合
     * @typedef  {Object}  getStepNeedExecReturn
     * @property {String}         step                         - 当前实例的步骤
     * @property {Array.<number>} currentActionIds             - [实例当前待执行的Action]
     * @property {Array.<ActionProgress>}  needExecActionsInfo - [实例当前待执行的Action简介集合]
     */

    /**
     * 获取实例的当前步骤 需要执行的Action 和相关的集合信息
     * @return {getStepNeedExecReturn}
     */
    getStepNeedExec() {
      const instance = this;

      debug('instance :%o', instance);

      const {
        currentStep: step,
        currentActionIds: actionIds,
        currentActionsInfo: actionsInfo,
      } = instance.getCurrentStepInfo();

      const needExecActionsInfo = actionIds.map((actionItem) => {
        const matchAction = _.find(actionsInfo, {
          id: actionItem,
        });

        const padInitAction = {
          id: actionItem,
          success: false,
        };

        return (matchAction && matchAction.success) ? null : (
          new ActionProgress(matchAction || padInitAction));
      }).filter(item => item);

      const needExecActionIds = needExecActionsInfo
        .map(item => !item.success && item.id)
        .filter(item => item);

      const exportInfo = {
        step,
        needExecActionsInfo,
        actionIds: needExecActionIds,
      };

      debug('needExecActionsInfo :%o', needExecActionsInfo);

      return exportInfo;
    }

    /**
     * 将结果信息集合合并生成相应的 `ActionInfo` 字段
     *
     * @param {Object[]} resultInfo                    - 结果信息集合
     * @param {number} resultInfo[].id                 - Action的id
     * @param {boolean} resultInfo[].success           - Action的结果是否成功
     * @param {number} resultInfo[].currentAttemptTime - Action的当前尝试次数
     * @param {number} resultInfo[].maxAttemptTime     - Action的最大允许尝试次数
     * @return {Array.<ActionProgress>} action的进度集合
     */
    mergeCurrentStepUpdateActionInfo(resultInfo) {
      const instance = this;
      const {
        currentActionIds: actionIds,
        currentActionsInfo: actionsInfo,
      } = instance.getCurrentStepInfo();

      const originActionsInfo = _.cloneDeep(actionsInfo);

      /**
       * 已最近更新结果为有限选择
       */
      const nextActionsInfo = actionIds.map((actionId) => {
        const originActionsInfoMatchItem = _.find(originActionsInfo, { id: actionId });
        const resultActionsInfoMatchItem = _.find(resultInfo, { id: actionId });

        let targetItem = originActionsInfoMatchItem || resultActionsInfoMatchItem;

        if (originActionsInfoMatchItem && resultActionsInfoMatchItem) {
          targetItem = originActionsInfoMatchItem.success ? (
            originActionsInfoMatchItem) : {
            ...originActionsInfoMatchItem,
            ...resultActionsInfoMatchItem,
          };
        }
        return targetItem;
      }).filter(item => item).map(item => new ActionProgress(item));

      return nextActionsInfo;
    }


    /**
     * 生成下一步的数据
     * createGoNextData
     * @param {Array.<object>} resultInfo              - 结果信息集合
     * @param {number} resultInfo[].id                 - Action的id
     * @param {boolean} resultInfo[].success           - Action的结果是否成功
     * @param {number} resultInfo[].currentAttemptTime - Action的当前尝试次数
     * @param {number} resultInfo[].maxAttemptTime     - Action的最大允许尝试次数
     */
    createGoNextData(resultInfo) {
      const instance = this;
      const {
        currentStep: originStep,
        currentActionIds,
      } = instance.getCurrentStepInfo();

      const nextUpdateActionInfo = instance.mergeCurrentStepUpdateActionInfo(resultInfo);

      let allActionIsAllCompleted = false; // 所有action 全部成功
      let someActionIsGtattemptLimit = false; // 是否有行为超出最大重试次数


      // all Action is Completed
      allActionIsAllCompleted = currentActionIds.every((itemId) => {
        const matchActionInfo = _.find(nextUpdateActionInfo, { id: itemId });

        return matchActionInfo && matchActionInfo.success;
      });


      // 没有全部通过时, 尝试调用是否有行为超过最大调用次数
      if (!allActionIsAllCompleted) {
        someActionIsGtattemptLimit = currentActionIds.some((itemId) => {
          const matchActionInfo = _.find(nextUpdateActionInfo, { id: itemId, success: false });
          return matchActionInfo && (
            matchActionInfo.currentAttemptTime >= matchActionInfo.maxAttemptTime);
        });
      }

      const updateData = {};

      // 更新步骤信息
      switch (originStep) {
      case STEP_TRYING:
        updateData.tryActionsInfo = nextUpdateActionInfo;
        break;
      case STEP_CONFIRMING:
        updateData.confirmActionsInfo = nextUpdateActionInfo;
        break;
      case STEP_CANCELLING:
        updateData.cancelActionsInfo = nextUpdateActionInfo;
        break;
      default:
        throw new Error(`${instance.id} step error`);
      }

      // 更新 step , status
      if (allActionIsAllCompleted) {
        switch (originStep) {
        case STEP_TRYING:
          updateData.step = STEP_CONFIRMING;
          updateData.tryAllCompleted = true;
          break;
        case STEP_CONFIRMING:
          updateData.status = STATUS_COMPLETED;
          updateData.confirmAllCompleted = true;
          break;
        case STEP_CANCELLING:
          updateData.status = STATUS_COMPLETED;
          updateData.cancelAllCompleted = true;
          break;
        default:
          break;
        }
      }

      // 超出限制，执行取消
      // 如果是 CANCELLING 步骤,则执行异常状态修改
      if (someActionIsGtattemptLimit) {
        switch (originStep) {
        case STEP_TRYING:
          updateData.step = STEP_CANCELLING;
          break;
        case STEP_CONFIRMING:
          updateData.step = STEP_CANCELLING;
          break;
        case STEP_CANCELLING:
          updateData.status = STATUS_ABNORMAL;
          break;
        default:
          break;
        }
      }

      return updateData;
    }
  }

  TransactionInstance.STATUS_INIT = STATUS_INIT;
  TransactionInstance.STATUS_RUNNING = STATUS_RUNNING;
  TransactionInstance.STATUS_COMPLETED = STATUS_COMPLETED;
  TransactionInstance.STATUS_ABNORMAL = STATUS_ABNORMAL;

  TransactionInstance.STEP_TRYING = STEP_TRYING;
  TransactionInstance.STEP_CONFIRMING = STEP_CONFIRMING;
  TransactionInstance.STEP_CANCELLING = STEP_CANCELLING;

  /**
   * setter *ActionsInfo
   * @param {string} fieldName
   */
  function getterActionsInfo(fieldName, idsFieldName) {
    function getterActionsInfoCreateActionProgress() {
      const idsArray = this.getDataValue(idsFieldName);
      const infoArray = this.getDataValue(fieldName);

      return idsArray.map((idItem) => {
        const originActionsInfoMatchItem = _.find(infoArray, { id: idItem });
        if (originActionsInfoMatchItem) {
          return new ActionProgress(originActionsInfoMatchItem);
        }
        return new ActionProgress({ id: idItem });
      });
    }
    return getterActionsInfoCreateActionProgress;
  }

  function setterActionsInfo(fieldName) {
    function setterActionsInfoForamt(array) {
      const instance = this;
      const data = [];

      const len = array.length;
      for (let index = 0; index < len; index += 1) {
        const ele = array[index];
        if (ele && ele.id) {
          const item = {
            id: ele.id,
            success: ele.success || false,
            maxAttemptTime: ele.maxAttemptTime || ActionProgress.DEFAULT_MAX_ATTEMPT_TIME,
            currentAttemptTime: ele.currentAttemptTime || 0,
          };
          data.push(item);
        }
      }

      instance.setDataValue(fieldName, data);
      return data;
    }
    return setterActionsInfoForamt;
  }

  /**
   * TransactionInstance 事务实例
   * 根据请求参数和 `项目(project)`, `进程(process)` 生成的实例
   * 标记每条事务的运行状态和结果
   * @memberof model
   * @namespace TransactionInstance
   * @property {string}           title                               - 项目名称
   * @property {string}           desc                                - 描述
   * @property {string}           messageId                           - 消息id/订单id, 用于标识事务, 每个项目 唯一不重复
   * @property {number}           projectId                           - 对应的项目id
   * @property {number}           proccessId                          - 对应的进程
   * @property {number}           actionId                            - 行为id
   * @property {string}           status                              - 状态 init 初始化 / running 运行中 / completed 完成 / abnormal 异常
   * @property {string}           step                                - 当前步骤 / trying / confirming / cancelling
   * @property {object}           log                                 - 日志信息
   * @property {object}           payload                             - 数据载体
   * @property {Array.<number>}   tryIds                              - TryAction 的 id集合
   * @property {Array.<number>}   confirmIds                          - Confirm 关联 id集合
   * @property {Array.<number>}   cancelIds                           - Cancel 关联 id集合
   * @property {boolean}          tryAllCompleted                     - TRY行为是否全部通过
   * @property {boolean}          confirmAllCompleted                 - Confirm行为是否全部通过
   * @property {boolean}          cancelAllCompleted                  - Cancel行为是否全部通过
   * @property {Array.<object>}   tryActionsInfo                      - TRY详细进度
   * @property {number}           tryActionsInfo.id                   - tryAction 的id
   * @property {boolean}          tryActionsInfo.success              - tryAction 是否执行成功
   * @property {number}           tryActionsInfo.maxAttemptTime       - tryAction 的最大允许执行次数
   * @property {number}           tryActionsInfo.currentAttemptTime   - tryAction 的当前执行次数
   * @property {Array.<object>}   confirmActionsInfo                  - Confirm详细进度
   * @property {Array.<object>}   cancelActionsInfo                   - Cancel详细进度
   * @property {number}           spacingMilliSeconds                 - 间隔毫秒,失败后再次执行的间隔
   *
   */
  TransactionInstance.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: '标题标题',
    },
    messageId: {
      type: DataTypes.STRING(225),
      allowNull: false,
      comment: '订单id',
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '项目id',
    },
    proccessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '进度id',
    },
    desc: {
      type: DataTypes.TEXT,
      comment: '流程描述',
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: true,
      defaultValue: STATUS_INIT,
      values: [STATUS_INIT, STATUS_RUNNING, STATUS_COMPLETED, STATUS_ABNORMAL],
      comment: `状态: ${STATUS_INIT} 初始化; ${STATUS_RUNNING} 运行中; ${STATUS_COMPLETED}完成; ${STATUS_ABNORMAL} 异常`,
    },
    step: {
      type: DataTypes.ENUM,
      allowNull: true,
      defaultValue: '',
      values: ['', STEP_TRYING, STEP_CONFIRMING, STEP_CANCELLING],
      comment: '步骤',
    },
    log: {
      type: DataTypes.JSON,
      comment: '日志',
    },
    payload: {
      type: DataTypes.JSON,
      comment: '数据载体',
    },
    // tcc
    tryIds: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Try 关联 id集合',
    },
    confirmIds: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Confirm 关联 id集合',
    },
    cancelIds: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Cancel 关联 id集合',
    },
    tryAllCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'TRY 行为全部通过',
    },
    confirmAllCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Confirm 行为全部通过',
    },
    cancelAllCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Cancel 行为全部通过',
    },
    tryActionsInfo: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'TRY 详细进度',
    },
    confirmActionsInfo: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Confirm 详细进度',
    },
    cancelActionsInfo: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Cancel 详细进度',
    },
    spacingMilliSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
      comment: '间隔毫秒',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    version: DataTypes.INTEGER,
  }, {
    timestamps: true,
    paranoid: false,
    version: true,
    freezeTableName: true,
    // define the table's name
    tableName: 'transaction-instances',
    modelName: 'TransactionInstance',
    sequelize,
    indexes: [
      { unique: true, fields: ['messageId', 'proccessId'] },
    ],
    getterMethods: {
      tryActionsInfo: getterActionsInfo('tryActionsInfo', 'tryIds'),
      confirmActionsInfo: getterActionsInfo('confirmActionsInfo', 'confirmIds'),
      cancelActionsInfo: getterActionsInfo('cancelActionsInfo', 'cancelIds'),
    },
    setterMethods: {
      tryActionsInfo: setterActionsInfo('tryActionsInfo'),
      confirmActionsInfo: setterActionsInfo('confirmActionsInfo'),
      cancelActionsInfo: setterActionsInfo('cancelActionsInfo'),
    },
  });

  return TransactionInstance;
};
