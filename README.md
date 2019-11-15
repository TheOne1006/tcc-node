TCC 型事务 node 实现

# 基础

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

## Model 模型介绍

- `项目(project)`
  - 管理项目, 包含多个 `进程(process)`, `行为(action)`
  - 包含字段
    - name: 项目名称
    - key: 项目key, 项目索引, 唯一不重复
    - desc: 描述
    - status: 状态 true 激活、 false 禁用
- `进程(process)`
  - 一个项目的其中一个完整事务过程, 拥有多个 `行为(action)`
  - 包含字段
    - projectId: 项目id
    - tryIds: [], 对应的 try行为 id
    - confirmIds: [], 对应的 Confirm行为 id
    - cancelIds: [], 对应的 Cancel 行为 id
    - name: 进程名称
    - key: 进程索引
    - desc: 描述
    - status: 状态 true 激活、 false 禁用
    - spacingMilliSeconds 间隔时间, 失败之后，下一次执行的间隔时间
- `行为(action)`
  - 属于 try / confirm / channel 之一的具体行为描述
  - 目前基于 http, 在访问指定接口后，对事物实例进行 更新
  - 包含字段
    - title: 行为标题
    - key: 行为key, 唯一不重复
    - projectId: 对应的项目id
    - desc: 描述
    - status: 状态 true 激活、 false 禁用
    - sendType: 发送方式 (目前仅支持 http & json)
    - attemptLimit: 最大重复次数
    - httpRequestTargetUri: 请求地址
    - httpRequestMethod: 请求方式
    - httpRequestTimeout: 请求超时
    - sendDataTemplate: 发送模板
    - httpResponseMatchTemplate: 命中结果的模板
    - httpResponseMatchSuccess: 命中结果
    - resetRequestScript: 请求前的可编程脚本
    - responseMatchSuccessScript: 编程响应脚本
- `事务实例(TransactionInstance)`
  - 根据请求参数和 `项目(project)`, `进程(process)` 生成的实例
  - 标记每条事务的运行状态和结果
    - 包含字段
      - title: 标题
      - messageId: 消息id/订单id, 用于标识事务, 每个项目 唯一不重复
      - projectId: 对应的项目id
      - proccessId: 进度id
      - desc: 描述
      - status: 状态 init 初始化 / running 运行中 / completed 完成 / abnormal 异常
      - step: 步骤
      - log: 日志
      - payload: 载体数据
      - tryIds: Try 关联 ids
      - confirmIds: confirmIds
      - cancelIds: cancelIds
      - tryAllCompleted: boolean
      - confirmAllCompleted: boolean
      - cancelAllCompleted: boolean
      - tryActionsInfo: any
      - confirmActionsInfo: any
      - spacingMilliSeconds: number
- `行为日志(ActionLog)`
  - 详细的记录 行为 `Action` 的每次执行
  - 包含字段
    - messageId: 消息id/订单id, 用于标识事务, 每个项目 唯一不重复
    - projectId: 对应的项目id
    - proccessId: 进度id
    - actionId: 行为id
    - isSuccess: 是否成功
    - payload: 数据载体
    - repData: 相应结果
    - currentAttemptTime: 当前尝试次数

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
````

## 技术栈

1. thrift: <http://thrift.apache.org/tutorial/nodejs>
2. rpc
3. redis
4. bull-queue
5. log4js
