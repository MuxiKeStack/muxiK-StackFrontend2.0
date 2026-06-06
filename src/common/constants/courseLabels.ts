// 课程属性映射（字符串键 + 整数枚举值）
const PROPERTY_STR_MAP: Record<string, string> = {
  CoursePropertyAny: '全部',
  CoursePropertyUnknown: '其它',
  CoursePropertyGeneralCore: '通识核心课',
  CoursePropertyGeneralElective: '通识选修课',
  CoursePropertyGeneralRequired: '通识必修课',
  CoursePropertyMajorCore: '专业主干课程',
  CoursePropertyMajorElective: '个性发展课程',
};

const PROPERTY_INT_MAP: Record<number, string> = {
  0: '全部',
  1: '其它',
  2: '通识核心课',
  3: '通识选修课',
  4: '通识必修课',
  5: '专业主干课程',
  6: '个性发展课程',
};

export const COURSE_PROPERTY_MAP = PROPERTY_STR_MAP;

// features映射（字符串键 + 整数枚举值）
export const COURSE_FEATURE_MAP: Record<string, string> = {
  EasyToLearn: '课程简单易学',
  RichInContent: '课程干货满满',
  Challenging: '课程很有挑战',
  RigorousAndResponsible: '老师严谨负责',
  KindAndEasygoing: '老师温柔随和',
  Humorous: '老师风趣幽默',
  LessHomework: '平时作业少',
  KeyPointsForFinal: '期末划重点',
  ComprehensiveOnlineMaterials: '云课堂资料全',
};

const FEATURE_INT_MAP: Record<number, string> = {
  0: '课程简单易学',
  1: '课程干货满满',
  2: '课程很有挑战',
  3: '老师严谨负责',
  4: '老师温柔随和',
  5: '老师风趣幽默',
  6: '平时作业少',
  7: '期末划重点',
  8: '云课堂资料全',
};

// 考核方式映射（字符串键 + 整数枚举值）
export const ASSESSMENT_MAP: Record<string, string> = {
  OpenBookExamination: '开卷考试',
  ClosedBookExamination: '闭卷考试',
  ThesisExamination: '论文考核',
  GroupReporting: '小组汇报',
  NoAssessment: '无考核',
};

const ASSESSMENT_INT_MAP: Record<number, string> = {
  0: '开卷考试',
  1: '闭卷考试',
  2: '论文考核',
  3: '小组汇报',
  4: '无考核',
};

// 将 features（数组或对象）翻译为中文标签数组
export const translateFeatures = (
  features?: string[] | Record<string, unknown>
): string[] => {
  if (!features) return [];
  const list = Array.isArray(features) ? features : Object.keys(features);
  return list
    .map((f) => COURSE_FEATURE_MAP[f] || FEATURE_INT_MAP[Number(f)] || f)
    .filter(Boolean);
};

// 将 assessments（数组或对象）翻译为中文标签数组
export const translateAssessments = (
  assessments?: string[] | Record<string, unknown>
): string[] => {
  if (!assessments) return [];
  const list = Array.isArray(assessments) ? assessments : Object.keys(assessments);
  return list
    .map((a) => ASSESSMENT_MAP[a] || ASSESSMENT_INT_MAP[Number(a)] || a)
    .filter(Boolean);
};

// 翻译单个课程属性（支持字符串枚举名、整数枚举值
export const translateCourseProperty = (prop?: string | number): string => {
  if (prop === undefined || prop === null) return '未分类';
  if (typeof prop === 'number') return PROPERTY_INT_MAP[prop] || '未分类';
  return PROPERTY_STR_MAP[prop] || PROPERTY_INT_MAP[Number(prop)] || prop;
};
