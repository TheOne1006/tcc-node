'use strict';

const curl = require('urllib');
const _ = require('lodash');

const MapperJson = require('mapper-json');

const SEND_TYPE_HTTP_REQUEST = 'http-request';

const HTTP_REQUEST_METHOD_POST = 'post';
const HTTP_REQUEST_METHOD_GET = 'get';

module.exports = (sequelize, DataTypes, BaseModel, core) => {
  const { vmCache, logger } = core;
  /**
   * @class
   * Action Model
   * @extends BaseModel
   */
  class Action extends BaseModel {
    /**
     * 通过 script 编程可以修改请求参数
     * @param {string} url
     * @param {object} options
     * @return {object} {url:xxx, options: {}}
     */
    resetRequestOptions(url = '', options = {}) {
      const instance = this;
      let result = {
        url,
        options,
      };

      if (!instance.resetRequestScript) {
        return result;
      }

      const sandBox = {
        url,
        options,
      };
      try {
        result = vmCache.runVmScript(instance.id, 'reset-request', instance.resetRequestScript, sandBox);
      } catch (error) {
        logger.warn(error);
        throw error;
      }

      return result;
    }

    /**
     * 发送http请求
     * @param {string} messageId 消息id
     * @param {object} payload 请求信息载体
     * @return {object} 响应体的 body
     */
    async sendHttp(messageId, payload) {
      const instance = this;
      const {
        httpRequestTargetUri: url,
        httpRequestMethod: method,
        httpRequestTimeout: timeout,
        sendDataTemplate: mapper,
      } = instance;


      const mapperJson = new MapperJson(mapper);

      const targetJson = mapperJson.trans(payload);

      const reqData = {
        ...targetJson,
        messageId,
      };

      const defaultOptions = {
        method,
        dataType: 'json',
        data: reqData,
        timeout,
      };

      // 处理前置脚本
      const reqOptions = instance.resetRequestOptions(url, defaultOptions);

      // 请求结果
      const rep = await curl.curl(reqOptions.url, reqOptions.options);

      const repData = rep.data;

      return repData;
    }


    /**
     * 脚本处理响应结果
     * @param {object} repData 响应结果
     * @return {object}
     */
    collectResponseMatchScript(repData) {
      const instance = this;

      let result = {
        repData,
      };

      if (!instance.responseMatchScript) {
        return result;
      }

      const sandBox = {
        repData,
      };
      try {
        result = vmCache.runVmScript(instance.id, 'response-match', instance.responseMatchScript, sandBox);
      } catch (error) {
        logger.warn(error);
        throw error;
      }

      return result;
    }

    /**
     * 是否符合预期结果
     * @param {object} repData
     * @return {boolean}
     */
    async isMatchResult(repData) {
      const instance = this;

      const scriptData = instance.collectResponseMatchScript(repData);

      return instance.matchResultWithTemplate(scriptData.repData);
    }

    /**
     * 判断结果是否满足条件根据, 与`httpResponseMatchSuccess`相同
     * @param {object} repData
     */
    async matchResultWithTemplate(repData) {
      const instance = this;
      const {
        httpResponseMatchTemplate: mapper,
        httpResponseMatchSuccess: matchResult,
      } = instance;

      const mapperJson = new MapperJson(mapper);

      const actual = mapperJson.trans(repData);

      return _.isEqual(actual, matchResult);
    }
  }

  Action.SEND_TYPE_HTTP_REQUEST = SEND_TYPE_HTTP_REQUEST;

  Action.HTTP_REQUEST_METHOD_POST = HTTP_REQUEST_METHOD_POST;
  Action.HTTP_REQUEST_METHOD_GET = HTTP_REQUEST_METHOD_GET;


  /**
   * Action 行为
   * 属于 try / confirm / channel 之一的具体行为描述
   * 目前基于 http, 在访问指定接口后，对事务实例进行更新
   * @memberof model
   * @namespace Action
   * @property {string}   title                        - 行为标题
   * @property {string}   key                          - 行为key, 唯一不重复
   * @property {string}   desc                         - 描述
   * @property {number}   projectId                    - 对应的项目id
   * @property {number}   proccessId                   - 对应的进程
   * @property {boolean}  status                       - 状态 true 激活、 false 禁用
   * @property {string}   sendType                     - 发送方式 (目前仅支持 http & json)
   * @property {number}   attemptLimit                 - 最大重复次数
   * @property {string}   httpRequestTargetUri         - 请求地址
   * @property {string}   httpRequestMethod            - 请求方式
   * @property {number}   httpRequestTimeout           - 请求超时
   * @property {string}   sendDataTemplate             - 发送模板
   * @property {string}   httpResponseMatchTemplate    - 命中结果的模板
   * @property {string}   httpResponseMatchSuccess     - 命中结果
   * @property {string}   resetRequestScript           - 请求前置可编程脚本
   * @property {string}   responseMatchSuccessScript   - 编程响应脚本
   */
  Action.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(225),
      allowNull: false,
      comment: '行为标题标题',
    },
    key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '行为key',
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '项目id',
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '流程描述',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: 'ENABLE 1 激活 DISABLE 0',
    },
    resetRequestScript: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
      comment: '编程请求脚本, 可缺省',
    },
    sendType: {
      type: DataTypes.ENUM,
      allowNull: true,
      defaultValue: SEND_TYPE_HTTP_REQUEST,
      values: [SEND_TYPE_HTTP_REQUEST],
      comment: '发送方式',
    },
    httpRequestTargetUri: {
      type: DataTypes.STRING(225),
      allowNull: true,
      defaultValue: '',
      comment: 'http 请求地址',
    },
    httpRequestMethod: {
      type: DataTypes.ENUM,
      allowNull: true,
      defaultValue: HTTP_REQUEST_METHOD_POST,
      values: [HTTP_REQUEST_METHOD_POST, HTTP_REQUEST_METHOD_GET],
      comment: 'http 发送方式 post/get',
    },
    httpRequestTimeout: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
      comment: 'http请求超时',
    },
    sendDataTemplate: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: '发送的数据模板',
    },
    sendDataTemplateDesc: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: '发送的数据模板描述',
    },
    httpResponseMatchTemplate: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: '命中结果模板',
    },
    httpResponseMatchSuccess: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'httpResponse 命中结果',
    },
    httpResponseMatchTemplateDesc: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'httpResponse 命中结果描述',
    },
    responseMatchSuccessScript: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
      comment: '编程响应脚本, 可缺省',
    },
    attemptLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: '尝试次数',
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
    tableName: 'actions',
    modelName: 'Action',
    sequelize,
    indexes: [
      { unique: true, fields: ['key', 'projectId'] },
    ],
  });

  return Action;
};
