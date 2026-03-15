import { request } from '../request';

export interface SearchCoursesRequest {
  biz: string;
  keyword: string;
  search_location: string;
}

const searchCourses = async (query: SearchCoursesRequest) => {
  return await request.get('/search', { query });
};

export default searchCourses;
