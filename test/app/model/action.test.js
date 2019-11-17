// const request = require('supertest');

const { assert } = require('chai');
const nock = require('nock');

// const ttypes = require('../../../gen/tutorial_types');

const actions = require('../../mockData/default.action');

describe('test/app/model/action.test.js', () => {
  // let app;
  before(async () => {
    await global.app.models.Action.sync({ force: true });
    await global.app.models.Action.bulkCreate(actions);
  });

  describe('resetRequestOptions', () => {
    it('resetRequestOptions throw error', async () => {
      const {
        Action,
      } = global.app.models;
      const instance = await Action.findByPk(1);
      instance.resetRequestScript = 'throw new Error("test_err");';

      let err;
      try {
        instance.resetRequestOptions('http://localhost', {});
      } catch (error) {
        err = error;
      }

      assert(err.message === 'test_err');
    });

    it('resetRequestOptions reset url', async () => {
      const {
        Action,
      } = global.app.models;
      const instance = await Action.findByPk(1);
      instance.resetRequestScript = 'url = "http://127.0.0.1";';

      const result = instance.resetRequestOptions('http://localhost', {});

      assert(result.url === 'http://127.0.0.1');
    });
  });

  describe('sendHttp', () => {
    it('sendHttp', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'messageId', b: [1, 'c'], t: '1' })
        .reply(200, {
          c: 'success',
        });

      const {
        Action,
      } = global.app.models;
      const instance = await Action.findByPk(1);
      const payload = {
        t: {
          c: '1',
        },
        b: 1,
        f: 'c',
      };

      const actual = await instance.sendHttp('messageId', payload);

      const expected = {
        c: 'success',
      };

      assert.deepEqual(actual, expected);
    });
  });

  describe('collectResponseMatchScript', () => {
    it('collectResponseMatchScript throw error', async () => {
      const {
        Action,
      } = global.app.models;
      const instance = await Action.findByPk(1);
      instance.responseMatchScript = 'throw new Error("collect err");';

      let err;
      try {
        instance.collectResponseMatchScript({});
      } catch (error) {
        err = error;
      }

      assert(err.message === 'collect err');
    });

    it('collectResponseMatchScript success', async () => {
      const {
        Action,
      } = global.app.models;
      const instance = await Action.findByPk(1);
      instance.responseMatchScript = 'repData = { foo: "bar"};';

      const actual = instance.collectResponseMatchScript({});

      const expected = {
        repData: {
          foo: 'bar',
        },
      };

      assert.deepEqual(actual, expected);
    });
  });


  describe('isMatchResult', () => {
    it('isMatchResult fail', async () => {
      const {
        Action,
      } = global.app.models;
      const instance = await Action.findByPk(1);
      const repData = {
        f: 'success',
      };

      const actual = instance.isMatchResult(repData);

      assert(actual, false);
    });

    it('isMatchResult success', async () => {
      const {
        Action,
      } = global.app.models;
      const instance = await Action.findByPk(1);
      const repData = {
        _c: 'success',
      };

      const actual = instance.isMatchResult(repData);

      assert(actual, true);
    });
  });
});
