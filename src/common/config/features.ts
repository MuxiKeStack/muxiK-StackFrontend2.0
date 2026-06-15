/**
 * 项目特性开关 & 调试配置
 *
 * 修改后重新编译即可生效，调用方无需改动。
 */

// 老登遗留的神秘接口，审核状态检查。关闭后跳过
export const FEATURES = {
  CHECK_STATUS: true,
};

/**
 * 调试配置 —— 仅开发环境生效
 *
 * ERROR_LEVEL 控制台输出级别：
 *   'verbose' — 所有错误信息（含完整堆栈、请求上下文）
 *   'normal'  — 仅错误摘要（默认）
 *   'silent'  — 关闭控制台输出，只走全局管道
 *
 * ERROR_TOAST 控制 Toast 提示：
 *   true  — 显示 Toast（默认）
 *   false — 关闭所有 Toast，静默处理
 */

export const DEBUG = {
  ERROR_LEVEL: 'verbose' as 'verbose' | 'normal' | 'silent',
  ERROR_TOAST: true,
};
