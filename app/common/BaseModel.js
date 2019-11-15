'use strict';

const Sequelize = require('sequelize');

// const { STRING, INTEGER, DATE, BOOLEAN, TEXT } = Sequelize;

/**
 * @class
 * BaseModel 项目的基础Model
 */
class BaseModel extends Sequelize.Model {
  /**
   * 输出错误
   * @param  {String} msg 错误描述
   * @return {Error} error
   */
  static errorModelNotFound(msg = 'Error Model', code = 'MODEL_ERROR') {
    const error = new Error(msg);
    error.statusCode = 404;
    error.code = code;
    return error;
  }

  /**
   * 查找一个实例, 未找到则报错
   * @param {object} filter 过滤对象
   * @return {object} 实例对象
   * @throws {Error} 未找到相关数据的报错信息
   */
  static async findOneOrThrow(filter) {
    const CurrentModel = this;
    const instance = await CurrentModel.findOne(filter);
    if (!instance) {
      throw BaseModel.errorModelNotFound('Not found Model', 'MODEL_NOT_FOUND');
    }
    return instance;
  }

  /**
   * 通过id查找一个实例, 未找到则报错
   * @param {object} filter 过滤对象
   * @return {object} 实例对象
   * @throws {Error} 未找到相关数据的报错信息
   */
  static async findByPkOrThrow(id) {
    const CurrentModel = this;
    return CurrentModel.findOneOrThrow({ where: { id } });
  }
}

module.exports = BaseModel;
