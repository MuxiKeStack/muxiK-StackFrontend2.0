import { searchCourses } from '@/common/request/api/research';
import type { SearchResultCourse } from '@/pages/research/types';

import { parseNextAfter, type SearchCursor } from './searchSession';
import { enhanceCourses } from './transforms';

export interface SearchPageResult {
  courses: SearchResultCourse[];
  nextAfter: SearchCursor | null;
}

export async function fetchSearchPage(
  keyword: string,
  search_location: string,
  cursor?: SearchCursor | null
): Promise<SearchPageResult> {
  const data = await searchCourses({
    biz: 'Course',
    keyword,
    search_location,
    ...(cursor ? { id: cursor.id, score: cursor.score } : {}),
  });
  return {
    courses: enhanceCourses((data.courses || []) as SearchResultCourse[]),
    nextAfter: parseNextAfter(data.next_after),
  };
}
