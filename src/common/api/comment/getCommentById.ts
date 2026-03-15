import { request } from '../request';

const getCommentById = async (commentId) => {
  return await request.post(`/comments/${commentId}/detail`);
};

export default getCommentById;
