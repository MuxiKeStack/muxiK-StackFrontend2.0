export const STATUS_LABELS = ['待处理', '处理中', '已完成'];

export const ISSUE_TYPE_MAP: Record<string, string> = {
  function: '功能异常',
  improvement: '产品改进',
};

export const MODULE_MAP: Record<string, string[]> = {
  function: ['首页板块', '课表板块', '其他板块', '登录相关', '加载/闪退', '其他问题'],
  improvement: ['界面设计', '功能建议', '体验问题', '账号相关', '其他问题'],
};

export const FAQ_TABLE_IDENTIFY = 'kstack-faq';
export const FEEDBACK_TABLE_IDENTIFY = 'kstack';

export const FAQ_RECORD_NAMES = ['问题名称', '问题描述', '解决方案', '已解决', '未解决'];

export const FEEDBACK_RECORD_NAMES = [
  '联系方式（QQ/邮箱）',
  '反馈内容',
  '截图',
  '问题类型',
  '问题来源',
  '进度',
  '提交时间',
  '回复内容',
];
