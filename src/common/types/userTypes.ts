export type UserInfo = {
  avatarUrl: string;
  nickName: string;
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
  new: boolean;
  nickname: string;
  studentId: string;
  title_ownership: { [key: string]: boolean };
  using_title: string;
  utime?: number;
};

export interface GradeResponse {
  code?: number;
  data?: GradeChart[];
  msg?: string;
}

export interface GradeChart {
  avg: number;
  grades: Grade[];
}

export interface Grade {
  percent?: number;
  total_grades: number[];
}

export interface ResponseQuestion {
  code?: number;
  data: WebQuestionVo[];
  msg?: string;
}

export interface WebQuestionVo {
  answer_cnt?: number;
  biz?: string;
  biz_id?: number;
  content: string;
  ctime?: number;
  id?: number;
  preview_answers: Answerv1Answer[];
  questioner_id?: number;
  utime?: number;
}

export interface Answerv1Answer {
  content?: string;
  ctime?: number;
  id?: number;
  publisher_id?: number;
  question_id?: number;
  utime?: number;
}
