import { request } from '../..';

export interface PublishCommentRequest {
  biz: string;
  biz_id: number;
  content: string;
  parent_id: number;
  root_id: number;
}

const publishComment = async (body: PublishCommentRequest) => {
  return await request.post('/comments/publish', body);
};

export default publishComment;
