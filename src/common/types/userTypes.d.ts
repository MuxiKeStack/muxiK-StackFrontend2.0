declare type UserInfo = {
  avatarUrl: string; // 用户头像的URL
  nickName: string; // 用户昵称
};

declare type ResponseLevel = {
  code?: number;
  data: WebPointInfoVo;
  msg?: string;
};

declare type WebPointInfoVo = {
  level: number;
  next_level_points: number;
  points: number;
};

declare type ResponseUser = {
  code?: number;
  data: WebUserProfileVo;
  msg?: string;
};

declare type WebUserProfileVo = {
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
/**
 * ginx.Result
 */
declare interface GradeResponse {
  /**
   * 错误码，非 0 表示失败
   */
  code?: number;
  data?: GradeChart[];
  /**
   * 错误或成功 描述
   */
  msg?: string;
}

/**
 * web.GradeChartVo
 */
declare interface GradeChart {
  avg: number;
  grades: Grade[];
}

declare interface Grade {
  percent?: number;
  total_grades: number[];
}
/**
 * ginx.Result
 */
declare interface ResponseQuestion {
  /**
   * 错误码，非 0 表示失败
   */
  code?: number;
  data: WebQuestionVo[];
  /**
   * 错误或成功 描述
   */
  msg?: string;
}

/**
 * web.QuestionVo
 */
declare interface WebQuestionVo {
  answer_cnt?: number;
  /**
   * 具体针对那种业务的提问，如 Course
   */
  biz?: string;
  biz_id?: number;
  content: string;
  ctime?: number;
  id?: number;
  preview_answers: Answerv1Answer[];
  /**
   * 提问者用户id
   */
  questioner_id?: number;
  utime?: number;
}

/**
 * answerv1.Answer
 */
declare interface Answerv1Answer {
  content?: string;
  ctime?: number;
  id?: number;
  publisher_id?: number;
  question_id?: number;
  utime?: number;
}
