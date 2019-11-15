'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BOOLEAN,
      DATE,
      INTEGER,
      TEXT,
      STRING,
    } = Sequelize;

    await queryInterface.createTable('actions', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: STRING(225),
        allowNull: false,
        comment: '行为标题标题',
      },
      key: {
        type: STRING(225),
        allowNull: false,
        comment: '行为key',
      },
      projectId: {
        type: INTEGER,
        allowNull: false,
        comment: '项目id',
      },
      desc: {
        type: TEXT,
        comment: '流程描述',
      },
      status: {
        type: BOOLEAN,
        allowNull: false,
        comment: 'ENABLE 1 激活 DISABLE 0',
      },
      resetRequestScript: {
        type: TEXT,
        allowNull: true,
        defaultValue: '',
        comment: '编程请求脚本, 可缺省',
      },
      sendType: {
        type: STRING(225),
        allowNull: true,
        defaultValue: 'http-request',
        comment: '发送方式',
      },
      httpRequestTargetUri: {
        type: STRING(225),
        allowNull: true,
        defaultValue: '',
        comment: 'http 请求地址',
      },
      httpRequestMethod: {
        type: STRING(30),
        allowNull: true,
        defaultValue: 'post',
        comment: 'http 发送方式 post/get',
      },
      httpRequestTimeout: {
        type: INTEGER,
        defaultValue: 1000,
        comment: 'http请求超时',
      },
      sendDataTemplate: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: '发送的数据模板',
      },
      sendDataTemplateDesc: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: '发送的数据模板描述',
      },
      httpResponseMatchSuccess: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'httpResponse 命中结果',
      },
      httpResponseMatchTemplate: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'httpResponse 结果模板',
      },
      httpResponseMatchTemplateDesc: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'httpResponse 命中结果描述',
      },
      responseMatchSuccessScript: {
        type: TEXT,
        allowNull: true,
        defaultValue: '',
        comment: '编程相应脚本, 可缺省',
      },
      attemptLimit: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: '尝试次数',
      },
      createdAt: DATE,
      updatedAt: DATE,
      version: INTEGER,
    });

    await queryInterface.addIndex('actions', ['key', 'projectId'], { indicesType: 'UNIQUE' });
  },
  down: queryInterface => queryInterface.dropTable('actions'),
};
