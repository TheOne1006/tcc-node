'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BOOLEAN,
      DATE,
      INTEGER,
      STRING,
    } = Sequelize;

    await queryInterface.createTable('action-logs', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      actionId: {
        type: INTEGER,
        allowNull: false,
        comment: 'actionId',
      },
      isSuccess: {
        type: BOOLEAN,
        defaultValue: false,
        comment: '是否成功',
      },
      payload: {
        type: Sequelize.JSON,
        comment: '数据载体, 调试错误',
      },
      repData: {
        type: Sequelize.JSON,
        comment: '相应结果',
      },
      errorMessage: {
        type: Sequelize.TEXT,
        comment: '异常信息',
      },
      currentAttemptTime: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: '当前的尝试次数',
      },
      createdAt: DATE,
      updatedAt: DATE,
      version: INTEGER,
    });

    await queryInterface.addIndex('action-logs', ['messageId', 'proccessId']);
  },
  down: queryInterface => queryInterface.dropTable('action-logs'),
};
