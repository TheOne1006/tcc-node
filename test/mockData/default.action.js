const data = [
  {
    id: 1,
    title: 'test-title1',
    key: 'test-title1',
    projectId: 1,
    desc: '测试action - try 1',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-try1.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 2,
    title: 'test-title2',
    key: 'test-title2',
    projectId: 1,
    desc: '测试action - try 2',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-try2.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 3,
    title: 'test-title3',
    key: 'test-title3',
    projectId: 1,
    desc: '测试action - try 3',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-try3.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 4,
    title: 'test-title4',
    key: 'test-title4',
    projectId: 4,
    desc: '测试action - comfrim 4',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-comfrim4.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 5,
    title: 'test-title5',
    key: 'test-title5',
    projectId: 1,
    desc: '测试action - comfrim 5',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-comfrim5.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 6,
    title: 'test-title6',
    key: 'test-title6',
    projectId: 1,
    desc: '测试action - comfrim 6',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-comfrim6.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 7,
    title: 'test-title7',
    key: 'test-title7',
    projectId: 1,
    desc: '测试action - cancel 7',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-cancel7.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 8,
    title: 'test-title8',
    key: 'test-title8',
    projectId: 1,
    desc: '测试action - cancel 8',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-cancel8.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 9,
    title: 'test-title9',
    key: 'test-title9',
    projectId: 1,
    desc: '测试action - cancel 9',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-cancel9.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },

  {
    id: 11,
    title: 'test-title1',
    key: 'process-job-test-title1',
    projectId: 1,
    desc: '测试action - try 1',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-try1.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 'tid', c: 'c' },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { result: 'success' },
    httpResponseMatchTemplate: { result: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 12,
    title: 'test-title2',
    key: 'process-job-test-title2',
    projectId: 1,
    desc: '测试action - try 2',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-try2.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 'tid', c: 'c' },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { result: 'success2' },
    httpResponseMatchTemplate: { result: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 13,
    title: 'test-title3',
    key: 'process-job-test-title3',
    projectId: 1,
    desc: '测试action - try 3',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-try3.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 'tid' },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { result: 'success3' },
    httpResponseMatchTemplate: { result: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 14,
    title: 'test-title4',
    key: 'process-job-test-title4',
    projectId: 4,
    desc: '测试action - comfrim 4',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-comfrim4.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 15,
    title: 'test-title5',
    key: 'process-job-test-title5',
    projectId: 1,
    desc: '测试action - comfrim 5',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-comfrim5.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 16,
    title: 'test-title6',
    key: 'process-job-test-title6',
    projectId: 1,
    desc: '测试action - comfrim 6',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-comfrim6.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 17,
    title: 'test-title7',
    key: 'process-job-test-title7',
    projectId: 1,
    desc: '测试action - cancel 7',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-cancel7.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 18,
    title: 'test-title8',
    key: 'process-job-test-title8',
    projectId: 1,
    desc: '测试action - cancel 8',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-cancel8.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 19,
    title: 'test-title9',
    key: 'process-job-test-title9',
    projectId: 1,
    desc: '测试action - cancel 9',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-cancel9.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't.c', b: ['b', 'f'] },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: '_c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },


  // tranTcc test
  {
    id: 21,
    title: 'tranTcc-singleActionExec-21',
    key: 'tranTcc-singleActionExec-21',
    projectId: 1,
    desc: '测试action - try 21',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-try1.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't', b: 'b' },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: 'c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
  {
    id: 22,
    title: 'tranTcc-singleActionExec-22',
    key: 'tranTcc-singleActionExec-22',
    projectId: 1,
    desc: '测试action - try 22',
    status: true,
    sendType: 'http-request',
    httpRequestTargetUri: 'http://test-try2.com',
    httpRequestMethod: 'post',
    httpRequestTimeout: 100,
    sendDataTemplate: { t: 't', b: 'b' },
    sendDataTemplateDesc: { t: 'test' },
    httpResponseMatchSuccess: { c: 'success' },
    httpResponseMatchTemplate: { c: 'c' },
    httpResponseMatchTemplateDesc: { c: 'desc' },
    attemptLimit: 5,
  },
];

module.exports = data;
