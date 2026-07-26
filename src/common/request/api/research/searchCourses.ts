import { request } from '../..';

export interface SearchCoursesRequest {
  biz: string;
  keyword: string;
  search_location: string;
  id?: number;
  score?: number;
}

const searchCourses = async (query: SearchCoursesRequest) => {
  return await request.get('/search', { query });
};

export default searchCourses;
