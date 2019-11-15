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
  class TransactionInstance extends BaseModel {
    /**
     * 获取当前步骤的相关信息
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
     * 暴露当前的步骤
     */
    exportCurrentStep() {
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
     * 获取当前步骤更新的 action 详情信息
     * @param {*} actionsResultInfo  各个action的结果
     */
    mergeCurrentStepUpdateActionInfo(actionsResultInfo) {
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
        const resultActionsInfoMatchItem = _.find(actionsResultInfo, { id: actionId });

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
     * 生成下一步的操作
     * createGoNextData
     */
    createGoNextData(actionsResultInfo) {
      const instance = this;
      const {
        currentStep: originStep,
        currentActionIds,
      } = instance.getCurrentStepInfo();

      const nextUpdateActionInfo = instance.mergeCurrentStepUpdateActionInfo(actionsResultInfo);

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

  // 初始化
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
      comment: 'Try 关联 ids',
    },
    confirmIds: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Confirm 关联 ids',
    },
    cancelIds: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Cancel 关联 ids',
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
