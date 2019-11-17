'use strict';

module.exports = (sequelize, DataTypes, BaseModel) => {
  /**
   * @class
   * Process Model
   * @extends BaseModel
   */
  class Process extends BaseModel {}

  /**
   * Process 进程
   * 一个项目的其中一个完整事务过程, 拥有多个 `行为(action)`
   * @memberof model
   * @namespace Process
   * @property {string}          name                         - 进程名称
   * @property {string}          key                          - 进程key, 唯一不重复
   * @property {string}          desc                         - 描述
   * @property {number}          projectId                    - 对应的项目id
   * @property {boolean}         status                       - 状态 true 激活、 false 禁用
   * @property {Array.<number>}  tryIds                       - 对应的 try 行为 id
   * @property {Array.<number>}  confirmIds                   - 对应的 Confirm 行为 id
   * @property {Array.<number>}  cancelIds                    - 对应的 Cancel 行为 id
   * @property {number}          spacingMilliSeconds          - 间隔时间, 失败之后，下一次执行的间隔时间
   */
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
