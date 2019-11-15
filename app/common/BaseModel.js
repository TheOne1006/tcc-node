'use strict';

const Sequelize = require('sequelize');

// const { STRING, INTEGER, DATE, BOOLEAN, TEXT } = Sequelize;

class BaseModel extends Sequelize.Model {
  /**
   * 排除未找到错误
   * @param  {String} msg 错误描述
   * @return {Error} error
   */
  static errorModelNotFound(msg = 'Error Model', code = 'MODEL_ERROR') {
    const error = new Error(msg);
    error.statusCode = 404;
    error.code = code;
    return error;
  }

  static async findOneOrThrow(filter) {
    const CurrentModel = this;
    const instance = await CurrentModel.findOne(filter);
    if (!instance) {
      throw BaseModel.errorModelNotFound('Not found Model', 'MODEL_NOT_FOUND');
    }
    return instance;
  }

  static async findByPkOrThrow(id) {
    const CurrentModel = this;
    return CurrentModel.findOneOrThrow({ where: { id } });
  }
}

module.exports = BaseModel;
