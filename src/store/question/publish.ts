import {
  publishQuestionAndBroadcast,
  type PublishedQuestionMeta,
  type PublishQuestionBody,
} from '@/actions/question/publishQuestion';

/** @deprecated 请使用 `publishQuestionAndBroadcast` from `@/actions` */
export const useQuestionPublishStore = {
  publish: (body: PublishQuestionBody, meta: PublishedQuestionMeta) =>
    publishQuestionAndBroadcast(body, meta),
};
