import { publishEvaluation } from '@/common/request/api/evaluations';

export const useEvaluatePublishStore = {
  async publish(body: Parameters<typeof publishEvaluation>[0]) {
    return publishEvaluation(body);
  },
};
