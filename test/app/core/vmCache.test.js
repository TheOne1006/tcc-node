const vm = require('vm');

const { assert } = require('chai');

// const ttypes = require('../../../gen/tutorial_types');

describe('test/app/core/vmCache.test.js', () => {
  let vmCache;

  before(async () => {
    const { vmCache: coreVmCache } = global.app.core;
    vmCache = coreVmCache;
  });

  describe('createVmBoxMd5', () => {
    // todo more
    it('createVmBoxMd5 return md5 str', async () => {
      const actual = await vmCache.createVmBoxMd5(
        'console.log(123);',
      );

      const expected = 'acfe1e0151cb19567a40c176a0f38751';
      assert(actual, expected);
    });
  });

  describe('createOrGetVmBoxes()', () => {
    it('createOrGetVmBoxes() for create', async () => {
      const result = await vmCache.createOrGetVmBoxes(
        1001,
        'test',
        'console.log("123")',
      );

      assert(result instanceof Object);
    });

    it('createOrGetVmBoxes() for cache', async () => {
      const result = await vmCache.createOrGetVmBoxes(
        1001,
        'test',
        'console.log("123")',
      );

      assert(result instanceof Object);
    });
  });

  describe('runVmScript()', () => {
    it('runVmScript() with modules', async () => {
      const modules = {
        lodash: {
          name: '_',
          path: 'lodash',
        },
      };

      const sandbox = {
        v: 't',
      };
      const result = await vmCache.runVmScript(
        1001,
        'test',
        'v = _g._.VERSION;',
        sandbox,
        modules,
      );

      assert(result.v >= '4.17.11');
    });
  });
});
