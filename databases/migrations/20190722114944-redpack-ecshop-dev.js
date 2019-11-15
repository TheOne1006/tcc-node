'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('actions', [
      {
        id: 101,
        title: '红包新闻-校验余额是否充足',
        key: 'redpack-news-ecshop-dev:action-check-blance',
        projectId: 101,
        desc: '红包新闻商城-校验余额是否充足',
        status: true,
        sendType: 'http-request',
        httpRequestTargetUri: 'http://114.55.100.52:7002/api/tccOrders/tryProcessWithECShop?access_token=76336330-79b9-11e8-9199-219d3f7f8384',
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
        id: 103,
        title: '红包新闻Ecshop-订单修改',
        key: 'redpack-news-ecshop-dev:order-confirm',
        projectId: 101,
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
        id: 104,
        title: '红包新闻-扣除余额',
        key: 'redpack-news-ecshop-dev:action-confirm',
        projectId: 101,
        desc: '红包新闻-扣除余额',
        status: true,
        sendType: 'http-request',
        httpRequestTargetUri: 'http://114.55.100.52:7002/api/tccOrders/confirmProcessWithECShop?access_token=76336330-79b9-11e8-9199-219d3f7f8384',
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
        id: 105,
        title: '红包新闻Ecshop-订单取消',
        key: 'redpack-news-ecshop-dev:order-cancel',
        projectId: 101,
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
        id: 106,
        title: '红包新闻-取消扣除余额',
        key: 'redpack-news:action-cancel',
        projectId: 101,
        desc: '红包新闻-取消扣除余额',
        status: true,
        sendType: 'http-request',
        httpRequestTargetUri: 'http://114.55.100.52:7002/api/tccOrders/cancelProcessWithECShop?access_token=76336330-79b9-11e8-9199-219d3f7f8384',
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
        id: 101,
        projectId: 101,
        tryIds: '[101]',
        confirmIds: '[104, 103]',
        cancelIds: '[106, 105]',
        name: '红包新闻: 购买商品消耗用户余额',
        key: 'redpack-news-ecshop-dev:use-app-blance',
        desc: '红包新闻商城',
        status: true,
        spacingMilliSeconds: 1000,
      },
    ]);

    return queryInterface.bulkInsert('projects', [
      {
        id: 101,
        name: '红包新闻商城',
        key: 'redpack-news-ecshop-dev',
        desc: '红包新闻商城',
        status: true,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('actions', [{ id: 101 }]);
    await queryInterface.bulkDelete('actions', [{ id: 103 }]);
    await queryInterface.bulkDelete('actions', [{ id: 104 }]);
    await queryInterface.bulkDelete('actions', [{ id: 105 }]);
    await queryInterface.bulkDelete('actions', [{ id: 106 }]);
    await queryInterface.bulkDelete('processes', [{ id: 101 }]);
    return queryInterface.bulkDelete('projects', [{ id: 101 }]);
  },
};
