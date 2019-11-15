'use strict';

const STATUS_ENABLE = 1;
const STATUS_DISABLE = 2;


module.exports = (sequelize, DataTypes, BaseModel) => {
  class Project extends BaseModel {}

  Project.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: '应用名称',
    },
    key: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: '应用key',
    },
    desc: {
      type: DataTypes.TEXT,
      comment: '应用描述',
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
