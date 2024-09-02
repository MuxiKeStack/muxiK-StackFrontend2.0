/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useEffect, useState } from 'react';

import { CommentInfo } from '@/common/assets/types';
import { Comment } from '@/common/components';
import { get } from '@/common/utils/fetch';
import uniqueKeyUtil from '@/common/utils/keyGen';

const History: React.FC = memo(() => {
  const [comments, setComments] = useState<CommentInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await get(
        `/evaluations/list/mine?cur_evaluation_id=${0}&limit=${10}&status=${'Public'}`
      );
      setComments(res.data);
    };
    void fetchData();
  }, []);

  return (
    <View className="flex h-screen flex-col items-center gap-4 overflow-y-scroll py-4">
      {comments.map((item) => (
        <Comment
          key={uniqueKeyUtil.nextKey()}
          type="inner"
          {...item}
          onClick={(props) => {
            const serializedComment = encodeURIComponent(JSON.stringify(props));
            void Taro.navigateTo({
              url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
            });
          }}
        />
      ))}
    </View>
  );
});

export default History;
