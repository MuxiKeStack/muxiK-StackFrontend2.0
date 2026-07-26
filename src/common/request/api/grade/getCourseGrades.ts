import { request } from '../..';

export interface GetCourseGrades {}

const getCourseGrades = async (courseId: number) => {
  return await request.get(`/grades/courses/${courseId}`);
};

export default getCourseGrades;
