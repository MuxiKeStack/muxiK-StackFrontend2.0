import type { ErrorSeverity } from './AppError';

interface ErrorCodeMeta {
  msg: string;
  severity?: ErrorSeverity;
  /** 特殊行为: redirectLogin | silent | none */
  action?: 'redirectLogin' | 'silent' | 'none';
}

/**
 * 业务错误码映射表
 *
 * 后端通过 ginx.Result { code, msg, data } 返回错误。
 * code === 0 表示成功，code !== 0 表示业务错误，msg 字段包含服务端返回的描述。
 *
 * 已确认的错误码：
 * - 407001: 重复签约
 * - 409002: 不能回答未上过的课
 *
 * 其余错误码需通过 curl 测试各接口的错误分支来确认。
 * 未知错误码会走 getErrorMeta 的 fallback，用服务端返回的 msg 兜底。
 */
export const ERROR_CODE_MAP: Record<number, ErrorCodeMeta> = {
  // 成功
  0: { msg: '操作成功', severity: 'silent', action: 'none' },

  // 认证 / 授权（待 curl 确认具体码值）

  // 评价 / 评论（待 curl 确认具体码值）

  // 回答
  409002: { msg: '不能回答未上过的课', severity: 'toast' },

  // 签约
  407001: { msg: '重复签约', severity: 'silent', action: 'silent' },
};

/** 根据错误码获取元信息（未定义则用服务端返回的 msg 兜底） */
export function getErrorMeta(code: number): ErrorCodeMeta {
  return ERROR_CODE_MAP[code] || { msg: `请求失败 (${code})`, severity: 'toast' };
}
