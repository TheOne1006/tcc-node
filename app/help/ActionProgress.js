
/**
 * 最大尝试次数, 系统默认
 */
const DEFAULT_MAX_ATTEMPT_TIME = 5;


/**
 * @typedef  {Object}  ActionProgress
 * @property {number}  id                 - Action的id
 * @property {boolean} success            - Action的结果是否成功
 * @property {number}  currentAttemptTime - Action的当前尝试次数
 * @property {number}  maxAttemptTime     - Action的最大允许尝试次数
 */

class ActionProgress {
  constructor(progress) {
    this.id = progress.id;
    this.success = progress.success || false;
    this.currentAttemptTime = progress.currentAttemptTime || 0;
    this.maxAttemptTime = progress.maxAttemptTime || (
      progress.attemptLimit || DEFAULT_MAX_ATTEMPT_TIME);
  }
}

ActionProgress.DEFAULT_MAX_ATTEMPT_TIME = DEFAULT_MAX_ATTEMPT_TIME;

module.exports = ActionProgress;
