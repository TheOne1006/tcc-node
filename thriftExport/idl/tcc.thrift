
namespace php App.Library.Thrift.Tcc

// Projec
enum ProjectStatusType {
    ENABLE = 1,
    DISABLE = 2
}

struct ProjectModel {
  1: required i32 id,
  2: required string key,
  3: required string name,
  4: optional string desc,
  5: ProjectStatusType status,
}


// service ProjectService {
//    void create(),
// }

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
