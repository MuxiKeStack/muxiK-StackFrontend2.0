import Taro from '@tarojs/taro';
import { memo } from 'react';

import { CommentInfo } from '@/common/assets/types';
import { Comment } from '@/common/components';

const CommentItem = memo(
  ({ id, index, data }: { id: string; index: number; data: CommentInfo[] }) => {
    const item = data[index];
    return (
      <Comment
        type="inner"
        {...item}
        onClick={(props) => {
          const serializedComment = encodeURIComponent(JSON.stringify(props));
          void Taro.navigateTo({
            url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
          });
        }}
      />
    );
  }
);

export default CommentItem;
