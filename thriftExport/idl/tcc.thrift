

/**
 * Thrift files can namespace, package, or prefix their output in various
 * target languages.
 * 设置对应的命名空间
 */
namespace php App.Library.Thrift.Tcc
namespace cl App.Library.Thrift.Tcc
namespace java App.Library.Thrift.Tcc
namespace perl App.Library.Thrift.Tcc


// Project Model 的 状态
enum ProjectStatusType {
    // 激活
    ENABLE = 1,
    // 禁用
    DISABLE = 2
}

// Project Model 属性
struct ProjectModel {
  // id
  1: required i32 id,
  // 索引 唯一值
  2: required string key,
  // 名称
  3: required string name,
  // 描述
  4: optional string desc,
  // 状态
  5: ProjectStatusType status,
}

// Process
enum ProcessStatusType {
    ENABLE = 1,
    DISABLE = 2
}

struct Process {
  1: required i32 id,
  2: required i32 projectId,
  3: required list<i32> tryIds,
  4: required list<i32> confirmIds,
  5: required list<i32> cancelIds,
  6: required string title,
  7: optional string desc,
  8: ProcessStatusType status,
  9: string key,
}

exception ErrorMessage {
  1: string message,
  2: i32 statusCode,
  3: string code,
}

struct TccInstance {
  1: i32 id,
  2: string status,
}

struct payload {
  1: i32 id,
  2: string status,
}

const map<string,string> MAPCONSTANT = {'userId':'0', 'tid':'1'}

service TranTcc {

   i32 ping(),

   TccInstance createInstance(
     1:string projectKey,
     2:string processKey,
     3:string messageId,
     4:map<string,string> payload,
    ) throws (1:ErrorMessage em),
}
