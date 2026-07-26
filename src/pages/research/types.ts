export interface SearchHistoryItem {
  id: number;
  keyword: string;
}

export interface SearchResultCourse {
  id: number;
  name: string;
  teacher: string;
  composite_score: number;
  /** 搜索相关性分数，仅用于分页游标 */
  score?: number;
  features?: string[] | Record<string, number>;
  assessments?: string[] | Record<string, number>;
  type?: number;
  property?: number;
  courseType?: string;
}
