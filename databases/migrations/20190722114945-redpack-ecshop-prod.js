'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('actions', [
      {
        id: 201,
        title: '红包新闻-校验余额是否充足',
        key: 'redpack-news-ecshop:action-check-blance',
        projectId: 201,
        desc: '红包新闻商城-校验余额是否充足',
        status: true,
        sendType: 'http-request',
        httpRequestTargetUri: 'http://news-api.prest3.com/api/tccOrders/tryProcessWithECShop?access_token=76336330-79b9-11e8-9199-219d3f7f8384',
        httpRequestMethod: 'post',
        httpRequestTimeout: 1000,
        sendDataTemplate: JSON.stringify({ tid: 'tid', changeBalance: 'changeBalance', appUserId: 'appUserId' }),
        sendDataTemplateDesc: JSON.stringify({ tid: 'tid', changeBalance: 'changeBalance', appUserId: 'appUserId' }),
        httpResponseMatchSuccess: JSON.stringify({ success: true }),
        httpResponseMatchTemplate: JSON.stringify({ success: 'success' }),
        httpResponseMatchTemplateDesc: JSON.stringify({ success: '是否成功' }),
        attemptLimit: 3,
      },
      {
        id: 203,
        title: '红包新闻Ecshop-订单修改',
        key: 'redpack-news-ecshop:order-confirm',
        projectId: 201,
        desc: '红包新闻Ecshop-订单修改',
        status: true,
        sendType: 'http-request',
        httpRequestTargetUri: 'http://localhost:81/v2/ecapi.tcc-order.confirm',
        httpRequestMethod: 'post',
        httpRequestTimeout: 1000,
        sendDataTemplate: JSON.stringify({ tid: 'tid', ecshopUserId: 'ecshopUserId' }),
        sendDataTemplateDesc: JSON.stringify({ tid: 'tid', ecshopUserId: 'ecshopUserId' }),
        httpResponseMatchSuccess: JSON.stringify({ error_code: 0 }),
        httpResponseMatchTemplate: JSON.stringify({ error_code: 'error_code' }),
        httpResponseMatchTemplateDesc: JSON.stringify({ error_code: '错误代码' }),
        attemptLimit: 3,
      },
      {
        id: 204,
        title: '红包新闻-扣除余额',
        key: 'redpack-news-ecshop:action-confirm',
        projectId: 201,
        desc: '红包新闻-扣除余额',
        status: true,
        sendType: 'http-request',
        httpRequestTargetUri: 'http://news-api.prest3.com/api/tccOrders/confirmProcessWithECShop?access_token=76336330-79b9-11e8-9199-219d3f7f8384',
        httpRequestMethod: 'post',
        httpRequestTimeout: 1000,
        sendDataTemplate: JSON.stringify({ tid: 'tid', changeBalance: 'changeBalance', appUserId: 'appUserId' }),
        sendDataTemplateDesc: JSON.stringify({ tid: 'tid', changeBalance: 'changeBalance', appUserId: 'appUserId' }),
        httpResponseMatchSuccess: JSON.stringify({ success: true }),
        httpResponseMatchTemplate: JSON.stringify({ success: 'success' }),
        httpResponseMatchTemplateDesc: JSON.stringify({ success: '是否成功' }),
        attemptLimit: 3,
      },
      {
        id: 205,
        title: '红包新闻Ecshop-订单取消',
        key: 'redpack-news-ecshop:order-cancel',
        projectId: 201,
        desc: '红包新闻Ecshop-订单取消',
        status: true,
        sendType: 'http-request',
        httpRequestTargetUri: 'http://localhost:81/v2/ecapi.tcc-order.cancel',
        httpRequestMethod: 'post',
        httpRequestTimeout: 1000,
        sendDataTemplate: JSON.stringify({ tid: 'tid', ecshopUserId: 'ecshopUserId' }),
        sendDataTemplateDesc: JSON.stringify({ tid: 'tid', ecshopUserId: 'ecshopUserId' }),
        httpResponseMatchSuccess: JSON.stringify({ error_code: 0 }),
        httpResponseMatchTemplate: JSON.stringify({ error_code: 'error_code' }),
        httpResponseMatchTemplateDesc: JSON.stringify({ error_code: '错误代码' }),
        attemptLimit: 3,
      },
      {
        id: 206,
        title: '红包新闻-取消扣除余额',
        key: 'redpack-news:action-cancel',
        projectId: 201,
        desc: '红包新闻-取消扣除余额',
        status: true,
        sendType: 'http-request',
        httpRequestTargetUri: 'http://news-api.prest3.com/api/tccOrders/cancelProcessWithECShop?access_token=76336330-79b9-11e8-9199-219d3f7f8384',
        httpRequestMethod: 'post',
        httpRequestTimeout: 1000,
        sendDataTemplate: JSON.stringify({ tid: 'tid', changeBalance: 'changeBalance', appUserId: 'appUserId' }),
        sendDataTemplateDesc: JSON.stringify({ tid: 'tid', changeBalance: 'changeBalance', appUserId: 'appUserId' }),
        httpResponseMatchSuccess: JSON.stringify({ success: true }),
        httpResponseMatchTemplate: JSON.stringify({ success: 'success' }),
        httpResponseMatchTemplateDesc: JSON.stringify({ success: '是否成功' }),
        attemptLimit: 3,
      },
    ]);

    await queryInterface.bulkInsert('processes', [
      {
        id: 201,
        projectId: 201,
        tryIds: '[201]',
        confirmIds: '[204, 203]',
        cancelIds: '[206, 205]',
        name: '红包新闻: 购买商品消耗用户余额',
        key: 'redpack-news-ecshop:use-app-blance',
        desc: '红包新闻商城',
        status: true,
        spacingMilliSeconds: 1000,
      },
    ]);

    return queryInterface.bulkInsert('projects', [
      {
        id: 201,
        name: '红包新闻商城',
        key: 'redpack-news-ecshop',
        desc: '红包新闻商城',
        status: true,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('actions', [{ id: 201 }]);
    await queryInterface.bulkDelete('actions', [{ id: 203 }]);
    await queryInterface.bulkDelete('actions', [{ id: 204 }]);
    await queryInterface.bulkDelete('actions', [{ id: 205 }]);
    await queryInterface.bulkDelete('actions', [{ id: 206 }]);
    await queryInterface.bulkDelete('processes', [{ id: 201 }]);
    return queryInterface.bulkDelete('projects', [{ id: 201 }]);
  },
};
