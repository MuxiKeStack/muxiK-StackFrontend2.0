import { request } from '../..';

export interface GetUserCoursesRequest {
  year: string;
  term: string;
}

const getUserCourses = async (query: GetUserCoursesRequest) => {
  return await request.get('/courses/list/mine', { query });
};

export default getUserCourses;
