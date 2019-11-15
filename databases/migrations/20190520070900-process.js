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

    await queryInterface.createTable('processes', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      projectId: {
        type: INTEGER,
        allowNull: false,
        comment: '项目id',
      },
      tryIds: {
        type: Sequelize.JSON,
        comment: 'Try 关联 ids',
      },
      confirmIds: {
        type: Sequelize.JSON,
        comment: 'Confirm 关联 ids',
      },
      cancelIds: {
        type: Sequelize.JSON,
        comment: 'Cancel 关联 ids',
      },
      name: {
        type: STRING(225),
        allowNull: false,
        comment: '进度标题',
      },
      key: {
        type: STRING(225),
        allowNull: false,
        comment: '流程key',
      },
      desc: {
        type: TEXT,
        comment: '流程描述',
      },
      status: {
        type: BOOLEAN,
        allowNull: false,
        comment: 'ENABLE true 激活 DISABLE false',
      },
      spacingMilliSeconds: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1000,
        comment: '间隔毫秒',
      },
      createdAt: DATE,
      updatedAt: DATE,
      version: INTEGER,
    });
  },
  down: queryInterface => queryInterface.dropTable('processes'),
};
