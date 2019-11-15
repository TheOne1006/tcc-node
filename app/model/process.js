'use strict';

module.exports = (sequelize, DataTypes, BaseModel) => {
  class Process extends BaseModel { }

  Process.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '项目id',
    },
    tryIds: {
      type: DataTypes.JSON,
      comment: 'Try 关联 ids',
    },
    confirmIds: {
      type: DataTypes.JSON,
      comment: 'Confirm 关联 ids',
    },
    cancelIds: {
      type: DataTypes.JSON,
      comment: 'Cancel 关联 ids',
    },
    name: {
      type: DataTypes.STRING(225),
      allowNull: false,
      comment: '进程标题',
    },
    key: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: 'key',
    },
    desc: {
      type: DataTypes.TEXT,
      comment: '应用描述',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: 'ENABLE true 激活 DISABLE false',
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
    tableName: 'processes',
    modelName: 'Process',
    sequelize,
    indexes: [
      { unique: true, fields: ['key', 'projectId'] },
    ],
  });

  return Process;
};
