// const request = require('supertest');

const { assert } = require('chai');

// const ttypes = require('../../../gen/tutorial_types');

const transactionInstances = require('../../mockData/default.transaction-instance');

describe('test/app/model/transaction-instance.test.js', () => {
  // let app;
  before(async () => {
    await global.app.models.TransactionInstance.sync({ force: true });
    await global.app.models.TransactionInstance.bulkCreate(transactionInstances);
  });

  describe('getStepNeedExec', () => {
    it('getStepNeedExec with empty step', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(1);
      const actual = instance.getStepNeedExec();
      const expected = {
        step: '',
        actionIds: [],
        needExecActionsInfo: [],
      };

      assert.deepEqual(actual, expected);
    });

    it('getStepNeedExec with try step', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(2);
      const actual = instance.getStepNeedExec();
      const expected = {
        step: 'trying',
        actionIds: [2, 3],
        needExecActionsInfo: [
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
          },
        ],
      };
      assert.deepEqual(actual, expected);
    });

    it('getStepNeedExec with confirm step', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(3);
      const actual = instance.getStepNeedExec();
      const expected = {
        step: 'confirming',
        actionIds: [4, 5, 6],
        needExecActionsInfo: [
          {
            id: 4,
            success: false,
            currentAttemptTime: 0,
            maxAttemptTime: 5,
          },
          {
            id: 5,
            success: false,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
          {
            id: 6,
            success: false,
            currentAttemptTime: 0,
            maxAttemptTime: 5,
          },
        ],
      };

      assert.deepEqual(actual, expected);
    });

    it('getStepNeedExec with cancel step', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(4);
      const actual = instance.getStepNeedExec();
      const expected = {
        step: 'cancelling',
        actionIds: [7, 9],
        needExecActionsInfo: [
          {
            id: 7,
            success: false,
            currentAttemptTime: 0,
            maxAttemptTime: 5,
          },
          {
            id: 9,
            success: false,
            currentAttemptTime: 0,
            maxAttemptTime: 5,
          },
        ],
      };

      assert.deepEqual(actual, expected);
    });
  });

  describe('mergeCurrentStepUpdateActionInfo', () => {
    it('mergeCurrentStepUpdateActionInfo with error data', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(5);
      const data = [{
        id: 1,
        success: true,
        currentAttemptTime: 0,
        maxAttemptTime: 5,
      }];

      const actual = instance.mergeCurrentStepUpdateActionInfo(data);

      const expected = [{
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
      }];
      assert.deepEqual(actual, expected);
    });

    it('mergeCurrentStepUpdateActionInfo success with success true', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(6);
      const data = [{
        id: 7,
        success: true,
        currentAttemptTime: 2,
        maxAttemptTime: 5,
      }];
      const actual = instance.mergeCurrentStepUpdateActionInfo(data);
      const expected = [
        {
          id: 7,
          success: true,
          currentAttemptTime: 2,
          maxAttemptTime: 5,
        },
        {
          id: 8,
          success: true,
          currentAttemptTime: 1,
          maxAttemptTime: 5,
        },
        {
          id: 9,
          success: false,
          currentAttemptTime: 0,
          maxAttemptTime: 5,
        },
      ];

      assert.deepEqual(actual, expected);
    });

    it('mergeCurrentStepUpdateActionInfo success with mixid', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(7);
      const data = [{
        id: 8,
        success: true,
        currentAttemptTime: 2,
        maxAttemptTime: 5,
      }, {
        id: 7,
        success: false,
        currentAttemptTime: 1,
        maxAttemptTime: 5,
      }, {
        id: 9,
        success: false,
        currentAttemptTime: 2,
        maxAttemptTime: 5,
      }];
      const actual = instance.mergeCurrentStepUpdateActionInfo(data);
      const expected = [
        {
          id: 7,
          success: true,
          currentAttemptTime: 1,
          maxAttemptTime: 5,
        },
        {
          id: 8,
          success: true,
          currentAttemptTime: 2,
          maxAttemptTime: 5,
        },
        {
          id: 9,
          success: false,
          currentAttemptTime: 2,
          maxAttemptTime: 5,
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });

  describe('createGoNextData', () => {
    it('createGoNextData success allActionIsAllCompleted  and originStep is STEP_CANCELLING ', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(11);
      const data = [{
        id: 8,
        success: true,
        currentAttemptTime: 2,
      }, {
        id: 9,
        success: true,
        currentAttemptTime: 2,
      }];
      const actual = instance.createGoNextData(data);
      const expected = {
        cancelAllCompleted: true,
        status: 'completed',
        cancelActionsInfo: [
          {
            id: 7,
            success: true,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
          {
            id: 8,
            success: true,
            currentAttemptTime: 2,
            maxAttemptTime: 5,
          },
          {
            id: 9,
            success: true,
            currentAttemptTime: 2,
            maxAttemptTime: 5,
          },
        ],
      };

      assert.deepEqual(actual, expected);
    });

    it('createGoNextData success allActionIsAllCompleted and originStep is STEP_CONFIRMING ', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(12);
      const data = [{
        id: 5,
        success: true,
        currentAttemptTime: 2,
      }, {
        id: 6,
        success: true,
        currentAttemptTime: 3,
      }];
      const actual = instance.createGoNextData(data);
      const expected = {
        confirmAllCompleted: true,
        status: 'completed',
        confirmActionsInfo: [
          {
            id: 4,
            success: true,
            currentAttemptTime: 1,
            maxAttemptTime: 3,
          },
          {
            id: 5,
            success: true,
            currentAttemptTime: 2,
            maxAttemptTime: 5,
          },
          {
            id: 6,
            success: true,
            currentAttemptTime: 3,
            maxAttemptTime: 10,
          },
        ],
      };

      assert.deepEqual(actual, expected);
    });

    it('createGoNextData success allActionIsAllCompleted and originStep is STEP_TRYING ', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(13);
      const data = [{
        id: 2,
        success: true,
        currentAttemptTime: 3,
      }];
      const actual = instance.createGoNextData(data);
      const expected = {
        step: 'confirming',
        tryAllCompleted: true,
        tryActionsInfo: [
          {
            id: 1,
            success: true,
            currentAttemptTime: 1,
            maxAttemptTime: 3,
          },
          {
            id: 2,
            success: true,
            currentAttemptTime: 3,
            maxAttemptTime: 10,
          },
          {
            id: 3,
            success: true,
            currentAttemptTime: 2,
            maxAttemptTime: 10,
          },
        ],
      };
      assert.deepEqual(actual, expected);
    });


    // someActionIsGtattemptLimit
    it('createGoNextData success someActionIsGtattemptLimit and originStep is STEP_CANCELLING', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(14);
      const data = [{
        id: 8,
        success: true,
        currentAttemptTime: 2,
      }, {
        id: 9,
        success: false,
        currentAttemptTime: 5,
      }];
      const actual = instance.createGoNextData(data);
      const expected = {
        status: 'abnormal',
        cancelActionsInfo: [
          {
            id: 7,
            success: true,
            currentAttemptTime: 1,
            maxAttemptTime: 5,
          },
          {
            id: 8,
            success: true,
            currentAttemptTime: 2,
            maxAttemptTime: 5,
          },
          {
            id: 9,
            success: false,
            currentAttemptTime: 5,
            maxAttemptTime: 5,
          },
        ],
      };
      assert.deepEqual(actual, expected);
    });
    it('createGoNextData success someActionIsGtattemptLimit and originStep is STEP_CONFIRMIN', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(15);
      const data = [{
        id: 5,
        success: true,
        currentAttemptTime: 2,
      }, {
        id: 6,
        success: false,
        currentAttemptTime: 10,
      }];
      const actual = instance.createGoNextData(data);
      const expected = {
        step: 'cancelling',
        confirmActionsInfo: [
          {
            id: 4,
            success: true,
            currentAttemptTime: 1,
            maxAttemptTime: 3,
          },
          {
            id: 5,
            success: true,
            currentAttemptTime: 2,
            maxAttemptTime: 5,
          },
          {
            id: 6,
            success: false,
            currentAttemptTime: 10,
            maxAttemptTime: 10,
          },
        ],
      };

      assert.deepEqual(actual, expected);
    });
    it('createGoNextData success someActionIsGtattemptLimit and originStep is STEP_TRYING', async () => {
      const {
        TransactionInstance,
      } = global.app.models;
      const instance = await TransactionInstance.findByPk(16);
      const data = [{
        id: 2,
        success: false,
        currentAttemptTime: 10,
      }];
      const actual = instance.createGoNextData(data);
      const expected = {
        step: 'cancelling',
        tryActionsInfo: [
          {
            id: 1,
            success: false,
            currentAttemptTime: 0,
            maxAttemptTime: 5,
          },
          {
            id: 2,
            success: false,
            currentAttemptTime: 10,
            maxAttemptTime: 5,
          },
          {
            id: 3,
            success: false,
            currentAttemptTime: 0,
            maxAttemptTime: 5,
          },
        ],
      };

      assert.deepEqual(actual, expected);
    });
  });
});
