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

    await queryInterface.createTable('transaction-instances', {
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
      messageId: {
        type: STRING(225),
        allowNull: false,
        comment: '订单id',
      },
      projectId: {
        type: INTEGER,
        allowNull: false,
        comment: '项目id',
      },
      proccessId: {
        type: INTEGER,
        allowNull: false,
        comment: '进度id',
      },
      desc: {
        type: TEXT,
        comment: '流程描述',
      },
      status: {
        type: STRING(30),
        allowNull: true,
        defaultValue: 'init',
        comment: '状态',
      },
      step: {
        type: STRING(30),
        allowNull: true,
        defaultValue: '',
        comment: '步骤',
      },
      payload: {
        type: Sequelize.JSON,
        comment: '数据载体',
      },
      log: {
        type: Sequelize.JSON,
        comment: '日志',
      },
      // tcc
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
      tryAllCompleted: {
        type: BOOLEAN,
        allowNull: false,
        comment: 'TRY 行为全部通过',
      },
      confirmAllCompleted: {
        type: BOOLEAN,
        allowNull: false,
        comment: 'Confirm 行为全部通过',
      },
      cancelAllCompleted: {
        type: BOOLEAN,
        allowNull: false,
        comment: 'Cancel 行为全部通过',
      },
      tryActionsInfo: {
        type: Sequelize.JSON,
        comment: 'TRY 详细进度',
      },
      confirmActionsInfo: {
        type: Sequelize.JSON,
        comment: 'Confirm 详细进度',
      },
      cancelActionsInfo: {
        type: Sequelize.JSON,
        comment: 'Cancel 详细进度',
      },
      spacingMilliSeconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000,
        comment: '间隔毫秒',
      },
      createdAt: DATE,
      updatedAt: DATE,
      version: INTEGER,
    });

    await queryInterface.addIndex('transaction-instances', ['messageId', 'proccessId'], { indicesType: 'UNIQUE' });
  },
  down: queryInterface => queryInterface.dropTable('transaction-instances'),
};
