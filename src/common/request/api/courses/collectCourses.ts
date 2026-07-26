import { request } from '../..';

export interface CollectCoursesRequest {
  collect: boolean;
}

const collectCourses = async (courseId: string | null, body: CollectCoursesRequest) => {
  return await request.post(`/courses/${courseId}/collect`, body);
};

export default collectCourses;
