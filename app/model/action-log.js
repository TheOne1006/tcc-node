'use strict';

module.exports = (sequelize, DataTypes, BaseModel) => {
  class ActionLog extends BaseModel {

  }
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
