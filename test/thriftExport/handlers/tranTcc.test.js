// const request = require('supertest');

const { assert } = require('chai');

// const ttypes = require('../../../gen/tutorial_types');

const projects = require('../../mockData/default.project');
const processes = require('../../mockData/default.process');

describe('test/thriftExport/handlers/tranTcc.test.js', () => {
  // let app;
  before(async () => {
    await global.app.models.Project.sync({ force: true });
    await global.app.models.Project.bulkCreate(projects);
    await global.app.models.Process.sync({ force: true });
    await global.app.models.Process.bulkCreate(processes);
    await global.app.models.TransactionInstance.sync({ force: true });
  });

  describe('ping test', () => {
    it('should render properly', async () => {
      const transTccClient = global.clients.TransTcc;
      const result = await transTccClient.ping();
      assert.equal(result === 1, true);
    });
  });

  describe('createInstance', () => {
    it('createInstance throw error', async () => {
      // console.info('err.message');
      const transTccClient = global.clients.TransTcc;
      let err;

      try {
        await transTccClient.createInstance('err');
      } catch (error) {
        err = error;
      }
      assert.equal(err.message, 'Not found Model');
      assert.equal(err.statusCode, 404);
      assert.equal(err.code, 'MODEL_NOT_FOUND');
    });

    it('createInstance with error arguments', async () => {
      // console.info('err.message');
      const transTccClient = global.clients.TransTcc;
      let err;
      try {
        await transTccClient.createInstance(
          'test',
          'project1-process',
          'tid-2',
          {
            foo: 2,
          },
        );
      } catch (error) {
        err = error;
      }

      assert.equal(err.message, 'writeString called without a string/Buffer argument: 2');
    });

    it('createInstance success', async () => {
      // console.info('err.message');
      const transTccClient = global.clients.TransTcc;

      const instance = await transTccClient.createInstance(
        'test',
        'project1-process',
        'tid-1',
        {
          t: '2',
          foo: '2',
        },
      );

      const tInstance = await global.app.models.TransactionInstance.findByPk(1);

      assert.deepEqual(tInstance.payload, {
        t: '2',
        foo: '2',
      });

      assert.equal(instance.id, 1);
      assert.equal(instance.status, 'init');
    });

    it('createInstance success again', async () => {
      // console.info('err.message');
      const transTccClient = global.clients.TransTcc;

      const instance = await transTccClient.createInstance(
        'test',
        'project1-process',
        'tid-3',
        {
          t: '3',
          foo: '3',
        },
      );
      assert.equal(instance.id, 2);
      assert.equal(instance.status, 'init');
    });

    it('createInstance success with same argument', async () => {
      // console.info('err.message');
      const transTccClient = global.clients.TransTcc;

      let err;
      try {
        await transTccClient.createInstance(
          'test',
          'project1-process',
          'tid-3',
          {
            t: '3',
            foo: '3',
          },
        );
      } catch (error) {
        err = error;
      }
      assert.equal(err.message, 'Validation error');
    });
  });
});
