export type UserInfo = {
  avatarUrl: string; // 用户头像的URL
  nickName: string; // 用户昵称
};

export type ResponseLevel = {
  code?: number;
  data: WebPointInfoVo;
  msg?: string;
};

export type WebPointInfoVo = {
  level: number;
  next_level_points: number;
  points: number;
};

export type ResponseUser = {
  code?: number;
  data: WebUserProfileVo;
  msg?: string;
};

export type WebUserProfileVo = {
  avatar: string;
  ctime: number;
  grade_sharing_is_signed?: boolean;
  id: number;
  /**
   * 是否为新用户，新用户尚未编辑过个人信息
   */
  new: boolean;
  nickname: string;
  studentId: string;
  title_ownership: { [key: string]: boolean };
  using_title: string;
  utime?: number;
};
