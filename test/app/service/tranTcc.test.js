// const request = require('supertest');
const nock = require('nock');
const { assert } = require('chai');

// const ttypes = require('../../../gen/tutorial_types');

const transactionInstances = require('../../mockData/default.transaction-instance');
const actions = require('../../mockData/default.action');
const projects = require('../../mockData/default.project');
const processes = require('../../mockData/default.process');

describe('test/app/service/tranTcc.test.js', () => {
  // let app;
  before(async () => {
    await global.app.models.TransactionInstance.sync({ force: true });
    await global.app.models.TransactionInstance.bulkCreate(transactionInstances);
    await global.app.models.Action.sync({ force: true });
    await global.app.models.Action.bulkCreate(actions);
    await global.app.models.ActionLog.sync({ force: true });
    await global.app.models.Project.sync({ force: true });
    await global.app.models.Project.bulkCreate(projects);
    await global.app.models.Process.sync({ force: true });
    await global.app.models.Process.bulkCreate(processes);
  });

  describe('createInstance', () => {
    it('createInstance success', async () => {
      const instance = await global.app.services.TranTcc.createInstance(
        'test',
        'project1-process',
        'message-1-sercice',
        {
          t: '2',
          foo: '2',
        },
      );

      const actual = instance.toJSON();
      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.id;
      delete actual.version;


      const expected = {
        title: 'test-project1-process',
        messageId: 'message-1-sercice',
        projectId: 1,
        proccessId: 1,
        desc: '',
        status: 'init',
        step: '',
        log: [],
        payload: { t: '2', foo: '2' },
        tryIds: [1, 2, 3],
        confirmIds: [4, 5, 6],
        cancelIds: [7, 8, 9],
        tryAllCompleted: false,
        confirmAllCompleted: false,
        cancelAllCompleted: false,
        tryActionsInfo: [{
          id: 1,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        },
        {
          id: 2,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        },
        {
          id: 3,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        }],
        confirmActionsInfo: [{
          id: 4,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        },
        {
          id: 5,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        },
        {
          id: 6,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        }],
        cancelActionsInfo: [{
          id: 7,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        },
        {
          id: 8,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        },
        {
          id: 9,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        }],
        spacingMilliSeconds: 1000,
      };

      assert.deepEqual(actual, expected);
    });
  });


  describe('singleActionExec', () => {
    it('singleActionExec throw error', async () => {
      const log = await global.app.services.TranTcc.singleActionExec(
        2220,
      );

      const actual = log.toJSON();
      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.id;
      delete actual.version;

      const expected = {
        messageId: '',
        projectId: 0,
        proccessId: 0,
        isSuccess: false,
        actionId: 2220,
        payload: {},
        currentAttemptTime: 1,
        errorMessage: 'Error: Not found Model',
      };

      assert.deepEqual(actual, expected);
    });

    it('singleActionExec failed', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-singleActionExec-21', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success1',
        });


      const log = await global.app.services.TranTcc.singleActionExec(
        21,
        {
          t: 'test',
          b: 'b',
        },
        'message-id-singleActionExec-21',
        10000,
        1000,
        1,
      );

      const actual = log.toJSON();
      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.id;
      delete actual.version;

      const expected = {
        messageId: 'message-id-singleActionExec-21',
        projectId: 10000,
        proccessId: 1000,
        repData: {
          c: 'success1',
        },
        isSuccess: false,
        actionId: 21,
        payload: {
          t: 'test',
          b: 'b',
        },
        currentAttemptTime: 2,
      };

      assert.deepEqual(actual, expected);
    });
    it('singleActionExec success', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-singleActionExec-21', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });


      const log = await global.app.services.TranTcc.singleActionExec(
        21,
        {
          t: 'test',
          b: 'b',
        },
        'message-id-singleActionExec-21',
        10000,
        1000,
        1,
      );

      const actual = log.toJSON();
      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.id;
      delete actual.version;

      const expected = {
        messageId: 'message-id-singleActionExec-21',
        projectId: 10000,
        proccessId: 1000,
        repData: {
          c: 'success',
        },
        isSuccess: true,
        actionId: 21,
        payload: {
          t: 'test',
          b: 'b',
        },
        currentAttemptTime: 2,
      };

      assert.deepEqual(actual, expected);
    });
  });

  describe('groupActionsExec', () => {
    it('groupActionsExec all failed', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-groupActionsExec-111', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success1',
        });

      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-groupActionsExec-111', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success1',
        });

      const actual = await global.app.services.TranTcc.groupActionsExec(
        [
          { id: 21, currentAttemptTime: 1 },
          { id: 22, currentAttemptTime: 2 },
        ],
        {
          t: 'test',
          b: 'b',
        },
        'message-id-groupActionsExec-111',
        10000,
        1000,
      );

      const expected = [
        {
          id: 21,
          success: false,
          currentAttemptTime: 2,
        },
        {
          id: 22,
          success: false,
          currentAttemptTime: 3,
        },
      ];

      assert.deepEqual(actual, expected);
    });

    it('groupActionsExec all success', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'messageId-groupActionsExec-111', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });

      nock('http://test-try2.com')
        .post('/', { messageId: 'messageId-groupActionsExec-111', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });

      const actual = await global.app.services.TranTcc.groupActionsExec(
        [
          { id: 21, currentAttemptTime: 1 },
          { id: 22, currentAttemptTime: 2 },
        ],
        {
          t: 'test',
          b: 'b',
        },
        'messageId-groupActionsExec-111',
        10000,
        1000,
      );

      const expected = [
        {
          id: 21,
          success: true,
          currentAttemptTime: 2,
        },
        {
          id: 22,
          success: true,
          currentAttemptTime: 3,
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });


  describe('try2NextStep', () => {
    it('try2NextStep failed and keep current step', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-41', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success1',
        });

      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-41', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });

      const actualObj = await global.app.services.TranTcc.try2NextStep(41);
      const actual = actualObj.toJSON();

      delete actual.id;
      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.version;

      const expected = {
        title: 'project-1-process-1-tid-41',
        messageId: 'message-id-41',
        projectId: 1,
        proccessId: 1,
        desc: 'test server.groupActionsExec',
        status: 'running',
        step: 'trying',
        log: null,
        payload: { b: 'b', t: 'test' },
        tryIds: [21, 22],
        confirmIds: [],
        cancelIds: [],
        tryAllCompleted: false,
        confirmAllCompleted: false,
        cancelAllCompleted: false,
        tryActionsInfo: [
          {
            id: 21,
            success: false,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
          {
            id: 22,
            success: true,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
        ],
        confirmActionsInfo: [],
        cancelActionsInfo: [],
        spacingMilliSeconds: 1000,
      };

      assert.deepEqual(actual, expected);
    });

    it('try2NextStep step trying change to confirming', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-42', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });

      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-42', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });

      const actualObj = await global.app.services.TranTcc.try2NextStep(42);
      const actual = actualObj.toJSON();

      delete actual.id;
      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.version;

      const expected = {
        title: 'project-1-process-1-tid-42',
        messageId: 'message-id-42',
        projectId: 1,
        proccessId: 1,
        desc: 'test server.groupActionsExec',
        status: 'running',
        step: 'confirming',
        log: null,
        payload: { b: 'b', t: 'test' },
        tryIds: [21, 22],
        confirmIds: [],
        cancelIds: [],
        tryAllCompleted: true,
        confirmAllCompleted: false,
        cancelAllCompleted: false,
        tryActionsInfo: [
          {
            id: 21,
            success: true,
            currentAttemptTime: 2,
            maxAttemptTime: 3,
          },
          {
            id: 22,
            success: true,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
        ],
        confirmActionsInfo: [],
        cancelActionsInfo: [],
        spacingMilliSeconds: 1000,
      };

      assert.deepEqual(actual, expected);
    });

    it('try2NextStep step trying change to cancelling', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-43', t: 'test', b: 'b' })
        .reply(200, {
          c: 'fail',
        });

      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-43', t: 'test', b: 'b' })
        .reply(200, {
          c: 'fail',
        });

      const actualObj = await global.app.services.TranTcc.try2NextStep(43);
      const actual = actualObj.toJSON();

      delete actual.id;
      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.version;

      const expected = {
        title: 'project-1-process-1-tid-43',
        messageId: 'message-id-43',
        projectId: 1,
        proccessId: 1,
        desc: 'test server.groupActionsExec',
        status: 'running',
        step: 'cancelling',
        log: null,
        payload: { b: 'b', t: 'test' },
        tryIds: [21, 22],
        confirmIds: [],
        cancelIds: [],
        tryAllCompleted: false,
        confirmAllCompleted: false,
        cancelAllCompleted: false,
        tryActionsInfo: [
          {
            id: 21,
            success: false,
            currentAttemptTime: 4,
            maxAttemptTime: 3,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
        ],
        confirmActionsInfo: [],
        cancelActionsInfo: [],
        spacingMilliSeconds: 1000,
      };

      assert.deepEqual(actual, expected);
    });

    it('try2NextStep step confirming change to cancelling', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-45', t: 'test', b: 'b' })
        .reply(200, {
          c: 'fail',
        });

      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-45', t: 'test', b: 'b' })
        .reply(200, {
          c: 'fail',
        });

      const actualObj = await global.app.services.TranTcc.try2NextStep(45);
      const actual = actualObj.toJSON();

      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.version;

      const expected = {
        id: 45,
        title: 'project-1-process-1-tid-45',
        messageId: 'message-id-45',
        projectId: 1,
        proccessId: 1,
        desc: 'test server.groupActionsExec',
        status: 'running',
        step: 'cancelling',
        log: null,
        payload: { b: 'b', t: 'test' },
        tryIds: [21, 22],
        confirmIds: [21, 22],
        cancelIds: [],
        tryAllCompleted: false,
        confirmAllCompleted: false,
        cancelAllCompleted: false,
        tryActionsInfo: [
          {
            id: 21,
            success: true,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
        ],
        confirmActionsInfo: [
          {
            id: 21,
            success: false,
            currentAttemptTime: 5,
            maxAttemptTime: 5,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
        ],
        cancelActionsInfo: [],
        spacingMilliSeconds: 1000,
      };

      assert.deepEqual(actual, expected);
    });

    it('try2NextStep step confirming, status running => completed', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-46', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });

      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-46', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });

      const actualObj = await global.app.services.TranTcc.try2NextStep(46);
      const actual = actualObj.toJSON();

      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.version;

      const expected = {
        id: 46,
        title: 'project-1-process-1-tid-46',
        messageId: 'message-id-46',
        projectId: 1,
        proccessId: 1,
        desc: 'test server.groupActionsExec',
        status: 'completed',
        step: 'confirming',
        log: null,
        payload: { b: 'b', t: 'test' },
        tryIds: [21, 22],
        confirmIds: [21, 22],
        cancelIds: [],
        tryAllCompleted: false,
        confirmAllCompleted: true,
        cancelAllCompleted: false,
        tryActionsInfo: [
          {
            id: 21,
            success: true,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
        ],
        confirmActionsInfo: [
          {
            id: 21,
            success: true,
            currentAttemptTime: 5,
            maxAttemptTime: 5,
          },
          {
            id: 22,
            success: true,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
        ],
        cancelActionsInfo: [],
        spacingMilliSeconds: 1000,
      };

      assert.deepEqual(actual, expected);
    });

    it('try2NextStep step cancelling, status running => completed', async () => {
      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-47', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success',
        });

      const actualObj = await global.app.services.TranTcc.try2NextStep(47);
      const actual = actualObj.toJSON();

      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.version;

      const expected = {
        id: 47,
        title: 'project-1-process-1-tid-47',
        messageId: 'message-id-47',
        projectId: 1,
        proccessId: 1,
        desc: 'test server.groupActionsExec',
        status: 'completed',
        step: 'cancelling',
        log: null,
        payload: { b: 'b', t: 'test' },
        tryIds: [21, 22],
        confirmIds: [21, 22],
        cancelIds: [21, 22],
        tryAllCompleted: true,
        confirmAllCompleted: false,
        cancelAllCompleted: true,
        tryActionsInfo: [
          {
            id: 21,
            success: true,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
        ],
        confirmActionsInfo: [
          {
            id: 21,
            success: false,
            currentAttemptTime: 4,
            maxAttemptTime: 5,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 0,
            maxAttemptTime: 5,
          },
        ],
        cancelActionsInfo: [
          {
            id: 21,
            success: true,
            currentAttemptTime: 2,
            maxAttemptTime: 3,
          },
          {
            id: 22,
            success: true,
            currentAttemptTime: 4,
            maxAttemptTime: 5,
          },
        ],
        spacingMilliSeconds: 1000,
      };

      assert.deepEqual(actual, expected);
    });

    it('try2NextStep step cancelling, status running => abnormal', async () => {
      nock('http://test-try1.com')
        .post('/', { messageId: 'message-id-48', t: 'test', b: 'b' })
        .reply(200, {
          c: 'failed',
        });
      nock('http://test-try2.com')
        .post('/', { messageId: 'message-id-48', t: 'test', b: 'b' })
        .reply(200, {
          c: 'success1',
        });

      const actualObj = await global.app.services.TranTcc.try2NextStep(48);

      const actual = actualObj.toJSON();

      delete actual.createdAt;
      delete actual.updatedAt;
      delete actual.version;

      const expected = {
        id: 48,
        title: 'project-1-process-1-tid-48',
        messageId: 'message-id-48',
        projectId: 1,
        proccessId: 1,
        desc: 'test server.groupActionsExec',
        status: 'abnormal',
        step: 'cancelling',
        log: null,
        payload: { b: 'b', t: 'test' },
        tryIds: [21, 22],
        confirmIds: [21, 22],
        cancelIds: [21, 22],
        tryAllCompleted: true,
        confirmAllCompleted: false,
        cancelAllCompleted: false,
        tryActionsInfo: [
          {
            id: 21,
            success: true,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
        ],
        confirmActionsInfo: [
          {
            id: 21,
            success: false,
            currentAttemptTime: 4,
            maxAttemptTime: 5,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 0,
            maxAttemptTime: 5,
          },
        ],
        cancelActionsInfo: [
          {
            id: 21,
            success: false,
            currentAttemptTime: 3,
            maxAttemptTime: 3,
          },
          {
            id: 22,
            success: false,
            currentAttemptTime: 4,
            maxAttemptTime: 5,
          },
        ],
        spacingMilliSeconds: 1000,
      };

      assert.deepEqual(actual, expected);
    });
  });
});
