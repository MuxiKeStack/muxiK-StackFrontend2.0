import Taro from '@tarojs/taro';
import { memo } from 'react';

import { FeedCard } from '@/common/components';
import type { CommentInfo } from '@/common/types/commentTypes';
import { bus } from '@/common/utils';

const CommentItem = memo(
  ({ id, index, data }: { id: string; index: number; data: CommentInfo[] }) => {
    const item = data[index];
    return (
      <FeedCard
        type="inner"
        comment={item}
        onClick={(comment) => {
          bus.stickyEmit('evaluation', comment);
          void Taro.navigateTo({ url: '/pages/evaluateInfo/index' });
        }}
      />
    );
  }
);

export default CommentItem;
