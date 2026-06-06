/** 分包页面路径（方案 B：页面位于 src/subpackages/<域>/pages/...） */
export const ROUTES = {
  profile: {
    myCollection: '/subpackages/profile/pages/myCollection/index',
    evaluationHistory: '/subpackages/profile/pages/evaluationHistory/index',
    editUser: '/subpackages/profile/pages/editUser/index',
  },
  feedback: {
    main: '/subpackages/feedback/pages/main/index',
    write: '/subpackages/feedback/pages/writefeedback/index',
    history: '/subpackages/feedback/pages/history/index',
    detail: '/subpackages/feedback/pages/detail/index',
  },
  course: {
    evaluate: '/subpackages/course/pages/evaluate/index',
    evaluateInfo: '/subpackages/course/pages/evaluateInfo/index',
    questionInfo: '/subpackages/course/pages/questionInfo/index',
    publishQuestion: '/subpackages/course/pages/publishQuestion/index',
  },
} as const;
