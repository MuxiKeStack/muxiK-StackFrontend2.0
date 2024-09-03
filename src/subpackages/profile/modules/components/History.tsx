/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useState } from 'react';

import { get } from '@/common/api/get';
import { CommentInfo } from '@/common/assets/types';
import { VirtualList } from '@/common/components';

import CommentItem from './CommentItem';

const History: React.FC = memo(() => {
  const [comments, setComments] = useState<CommentInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [end, setEnd] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (end) {
      void Taro.hideLoading();
      return;
    }
    const res = await get(
      `/evaluations/list/mine?cur_evaluation_id=${index}&limit=${10}&status=${'Public'}`
    );
    setComments([...comments, ...res.data]);
    if (res.data.length < 10) {
      setEnd(true);
    } else {
      setIndex(res.data[res.data.length - 1].id);
    }
    setLoading(false);
    void Taro.hideLoading();
  }, [comments, end, index]);

  const listReachBottom = () => {
    setLoading(true);
    setTimeout(() => {
      void fetchData();
    }, 1000);
  };

  useEffect(() => {
    void Taro.showLoading({ title: '加载中' });
    void fetchData();
  }, [fetchData]);

  return (
    <View className="flex h-screen flex-col items-center gap-4 overflow-y-scroll py-4">
      <VirtualList
        height="100%"
        width="100%"
        item={CommentItem}
        itemData={comments}
        itemCount={comments.length}
        itemSize={220}
        onScroll={({ scrollDirection, scrollOffset }) => {
          if (
            !loading &&
            scrollDirection === 'forward' &&
            scrollOffset > (comments.length - 5) * 220 + 100
          )
            listReachBottom();
        }}
      />
    </View>
  );
});

export default History;
