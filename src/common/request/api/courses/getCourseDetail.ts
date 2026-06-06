import { request } from '../..';

export interface GetCourseDetail {}

const getCourseDetail = async (courseId: number) => {
  return await request.get(`/courses/${courseId}/detail`);
};

export default getCourseDetail;
