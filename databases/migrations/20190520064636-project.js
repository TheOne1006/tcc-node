'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      INTEGER,
      DATE,
      STRING,
      TEXT,
      BOOLEAN,
    } = Sequelize;

    await queryInterface.createTable('projects', {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: STRING(225),
        allowNull: false,
        comment: '应用名称',
      },
      key: {
        type: STRING(225),
        allowNull: false,
        comment: '应用key',
      },
      desc: {
        type: TEXT,
        comment: '应用描述',
      },
      status: {
        type: BOOLEAN,
        allowNull: false,
        comment: 'ENABLE true 激活 DISABLE false',
      },
      createdAt: DATE,
      updatedAt: DATE,
      version: INTEGER,
    });

    await queryInterface.addIndex('projects', ['name'], { indicesType: 'UNIQUE' });
    await queryInterface.addIndex('projects', ['key'], { indicesType: 'UNIQUE' });
  },
  down: queryInterface => queryInterface.dropTable('projects'),
};
