
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]

[travis-image]: https://img.shields.io/travis/TheOne1006/tcc-node.svg?style=flat-square
[travis-url]: https://travis-ci.org/TheOne1006/tcc-node.svg?branch=master
[codecov-image]: https://img.shields.io/codecov/c/github/TheOne1006/tcc-node.svg?style=flat-square
[codecov-url]: https://codecov.io/github/TheOne1006/tcc-node?branch=master
[david-image]: https://img.shields.io/david/TheOne1006/tcc-node.svg?style=flat-square
[david-url]: https://david-dm.org/TheOne1006/tcc-node

TCC 型事务 node 实现, 该项目为我在项目中需要, 处理商城与应用之间的资金处理所做。

文档: <https://theone1006.github.io/tcc-node/>

## 基础

> TCC事务机制简介

- Try: 尝试执行业务
  - 完成所有业务检查（一致性）
  - 预留必须业务资源（准隔离性）
- Confirm: 确认执行业务
  - 真正执行业务
  - 只使用Try阶段预留的业务资源
  - Confirm操作满足幂等性
- Cancel: 取消执行业务
  - 释放Try阶段预留的业务资源
  - Cancel操作满足幂等性

> 业务逻辑

1. 创建 `项目(project)`, `进程(process)`, `行为(action)` 这些基础配置
2. 通过结果创建 `事务实例(TransactionInstance)`
3. 将初始状态的实例加入执行队列
4. 一次执行实例对应的 tryAction
5. 如果某个 tryAction 超过设置的失败次数, 将执行 cancelAction
6. 如果所有的 tryAction 都成功执行, 将继续执行 confirmAction
7. 如果 confirmAction 超过执行次数都没有成功, 将执行 cancelAction
8. 如果 confirmAction/cancelAction 超过一定次数都没有执行成功, 则实例状态将标记为异常，需要人工干涉

## Model 模型介绍

详见:[模型](./model.html)

## 技术栈

1. thrift: <http://thrift.apache.org/tutorial/nodejs>
2. rpc
3. redis
4. bull-queue
5. log4js

## 本地测试

测试基于 redis, 和 mysql, 先修改 `config.test.js` 相关配置

```bash
npm run install
npm run test
```

## 线上部署

1. `pm2.json` 配置 pm2 实例数量
2. `rpc-server` rpc 的服务
3. `http-server` http 服务
4. `schedule` 定时任务
5. `queue` 队列任务

## 支持

- rpc/http 调用方式

## 如何使用 thrift

### step 1. 生成文件

修改 `thriftExport/idl/tcc.thrift` 文件, 修改你需要的命名空间

```bash
# 根据语言 执行编译命令
thrift --out ./thriftExport/thrift_php_gen --gen php thriftExport/idl/tcc.thrift
# 在 thriftExport/thrift_php_gen 目录下生成相应的文件
```

### step 2.将编译文件加入项目

将编译文件移动到项目中的目录(具体情况请参考各自语言)

### step 3.编写具体代码
```php
use App\Library\Thrift\Tcc\TranTccClient;
use Thrift\Protocol\TBinaryProtocol;
use Thrift\Protocol\TJSONProtocol;
use Thrift\Protocol\TMultiplexedProtocol;
use Thrift\Transport\TBufferedTransport;
use Thrift\Transport\TSocket;

/**
 * 这里使用的是 socket 链接
 */
try {
    // 创建 socket 实例
    $socket = new TSocket($this->config['host'], $this->config['port']);
    $socket->setRecvTimeout(50000);
    $socket->setDebug(true);

    // 创建客户端访问实例
    $transport = new TBufferedTransport($socket);
    $protocol = new TJSONProtocol($transport);
    $client = new TranTccClient($protocol);
    $transport->open();

    /**
     * 参数参考 thriftExport/idl/tcc.thrift
     */
    $params = [
      'projectKey',
      'processKey',
      'order_id',
      [
        'userId' => 12,
        'momeny' => 300,
      ]
    ];

    $result = $client->createInstance($params);
    $transport->close();
    return $result;
} catch (\TException $Te) {
  throw $Te->getMessage();
}
```
