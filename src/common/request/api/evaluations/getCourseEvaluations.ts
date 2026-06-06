import { request } from '../..';

export interface GetCourseEvaluationsRequest {
  cur_evaluation_id: number;
  limit: number;
}

const getCourseEvaluations = async (
  courseId: number,
  query: GetCourseEvaluationsRequest
) => {
  return await request.get(`/evaluations/list/courses/${courseId}`, { query });
};

export default getCourseEvaluations;
