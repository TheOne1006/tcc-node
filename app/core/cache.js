'use strict';

const manager = require('cache-manager');
const debug = require('debug')('app:core:cache');
const Store = require('./lib/store');

const drivers = Object.create(null);

function createStore(cacheConfig) {
  const { default: defaultStore, stores } = cacheConfig;

  const store = (name, options = {}) => {
    if (!drivers[name]) {
      const config = stores[name];

      if (!stores[name]) {
        throw new Error(`Store ${name} is not support.`);
      }

      const storeOptions = Object.assign({
        store: config.driver,
        valid: _ => _ !== undefined,
      }, stores[name], options);

      const driver = manager.caching(storeOptions);

      debug('storeOptions: %o', storeOptions);

      drivers[name] = new Store(driver, storeOptions);
    }

    return drivers[name];
  };

  return {
    store,
    set: (...args) => store(defaultStore).set(...args),
    get: (...args) => store(defaultStore).get(...args),
    del: (...args) => store(defaultStore).del(...args),
    has: (...args) => store(defaultStore).has(...args),
    reset: (...args) => store(defaultStore).reset(...args),
  };
}

module.exports = (config, core) => {
  if (config.cache) {
    core.cache = createStore(config.cache, core);
  }
};
