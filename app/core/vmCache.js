const vm = require('vm');
const LRU = require('lru-cache');
const crypto = require('crypto');
const path = require('path');
const _ = require('lodash');

function vmCacheCreate(vmMaxLength = 20) {
  const cache = new LRU(vmMaxLength);
  const vmCache = {
    /**
     * vm 脚本执行md5
     * @param {*} scriptText
     */
    createVmBoxMd5(scriptText) {
      const md5Crypto = crypto.createHash('md5');
      const md5Str = md5Crypto.update(scriptText).digest('hex');
      return md5Str;
    },

    /**
     * 创建或者获取 vm 上下文
     * @param {number} modelId 模型id
     * @param {string} action 行为标记
     * @param {string} scriptText 脚本
     */
    createOrGetVmBoxes(modelId = 0, action = '', scriptText = '') {
      const md5Str = vmCache.createVmBoxMd5(scriptText);
      const key = `${action}-${modelId}-${md5Str}`;

      let vBox = cache.get(key);

      if (!vBox) {
        const script = new vm.Script(scriptText);
        cache.set(key, script);
        vBox = script;
      }

      return vBox;
    },

    /**
     * 执行 vm 脚本
     * @param {number} modelId 模型id
     * @param {string} action 行为标记
     * @param {string} scriptText 脚本
     * @param {object} sandboxParams 沙盒参数
     * @param {array} loadModules 加载modules
     * [{name: '_', path: 'lodash'}, { name: help, path: 'help.js', inApp: true }]
     */
    runVmScript(modelId = 0, action = '', scriptText = '', sandboxParams = {}, loadModules = []) {
      const vmScript = vmCache.createOrGetVmBoxes(modelId, action, scriptText);

      const keys = _.keys(sandboxParams);

      const vmGlobal = {};

      _.map(loadModules, (item) => {
        let modulePath = item.path;
        if (item.inApp) {
          const rootPath = path.join(__dirname, '../');
          modulePath = path.join(rootPath, modulePath);
        }
        // eslint-disable-next-line
        vmGlobal[item.name] = require(modulePath);
      });

      const globalParams = {
        ...sandboxParams,
        _g: vmGlobal,
      };

      try {
        vmScript.runInNewContext(globalParams);
      } catch (error) {
        throw error;
      }
      return _.pick(globalParams, keys);
    },
  };

  return vmCache;
}

module.exports = (config, core) => {
  core.vmCache = vmCacheCreate(config.vmCacheLength);
};
