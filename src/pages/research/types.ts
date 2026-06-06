export interface SearchHistoryItem {
  id: number;
  keyword: string;
}

export interface SearchResultCourse {
  id: number;
  name: string;
  teacher: string;
  composite_score: number;
  features?: string[] | Record<string, number>;
  assessments?: Record<string, number>;
  type?: number;
  property?: number;
  courseType?: string;
}
