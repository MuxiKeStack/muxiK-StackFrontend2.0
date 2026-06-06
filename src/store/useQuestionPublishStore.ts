import { publishQuestion } from '@/common/request/api/questions';

export const useQuestionPublishStore = {
  async publish(body: Parameters<typeof publishQuestion>[0]) {
    return publishQuestion(body);
  },
};
