'use strict';

const STATUS_ENABLE = true;
const STATUS_DISABLE = false;


module.exports = (sequelize, DataTypes, BaseModel) => {
  /**
   * @class
   * Project Model
   * @extends BaseModel
   */
  class Project extends BaseModel {}

  /**
   * Project 项目
   * 管理项目, 包含多个 `进程(process)`, `行为(action)`
   * @memberof model
   * @namespace Project
   * @property {string}   name      - 项目名称
   * @property {string}   key       - 项目key, 唯一不重复
   * @property {string}   desc      - 描述
   * @property {boolean}  status    - 状态 true 激活、false 禁用
   */
  Project.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: '项目名称',
    },
    key: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: '项目key',
    },
    desc: {
      type: DataTypes.TEXT,
      comment: '项目描述',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: `ENABLE ${STATUS_ENABLE} 激活 DISABLE ${STATUS_DISABLE} 禁用`,
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
    tableName: 'projects',
    modelName: 'Project',
    sequelize,
    indexes: [
      { unique: true, fields: ['key'] },
    ],
  });

  return Project;
};
