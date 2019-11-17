'use strict';

module.exports = (sequelize, DataTypes, BaseModel) => {
  /**
   * @class
   * ActionLog Action 日志
   * @extends BaseModel
   */
  class ActionLog extends BaseModel {
  }


  /**
   * Action日志
   * 详细的Action请求记录
   * @memberof model
   * @namespace ActionLog
   * @property {string}   messageId            - 消息id/订单id, 用于标识事务, 每个项目 唯一不重复
   * @property {number}   projectId            - 对应的项目id
   * @property {number}   proccessId           - 对应的进程
   * @property {number}   actionId             - 行为id
   * @property {boolean}  isSuccess            - 是否成功
   * @property {object}   payload              - 请求数据载体
   * @property {object}   repData              - 响应体结果
   * @property {string}   errorMessage         - 异常误信息
   * @property {number}   currentAttemptTime   - 当前尝试次数
   */
  ActionLog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    actionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'actionId',
    },
    isSuccess: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否成功',
    },
    payload: {
      type: DataTypes.JSON,
      comment: '数据载体, 调试错误',
    },
    repData: {
      type: DataTypes.JSON,
      comment: '相应结果',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      comment: '相应结果',
    },
    currentAttemptTime: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '当前的尝试次数',
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
    tableName: 'action-logs',
    modelName: 'ActionLog',
    sequelize,
    indexes: [
      { unique: false, fields: ['messageId', 'proccessId'] },
    ],
  });

  return ActionLog;
};
