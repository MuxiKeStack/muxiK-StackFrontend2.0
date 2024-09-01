import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo } from 'react';

import { Comment } from '@/common/components';
import uniqueKeyUtil from '@/common/utils/keyGen';

const History: React.FC = memo(() => {
  return (
    <View className="flex h-screen flex-col items-center gap-0.5 overflow-y-scroll py-2">
      <Comment
        onClick={(props) => {
          const serializedComment = encodeURIComponent(JSON.stringify(props));
          void Taro.navigateTo({
            url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
          });
        }}
        key={uniqueKeyUtil.nextKey()}
        type="inner"
      />
      <Comment
        onClick={(props) => {
          const serializedComment = encodeURIComponent(JSON.stringify(props));
          void Taro.navigateTo({
            url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
          });
        }}
        key={uniqueKeyUtil.nextKey()}
        type="inner"
      />
      <Comment
        onClick={(props) => {
          const serializedComment = encodeURIComponent(JSON.stringify(props));
          void Taro.navigateTo({
            url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
          });
        }}
        key={uniqueKeyUtil.nextKey()}
        type="inner"
      />
      <Comment
        onClick={(props) => {
          const serializedComment = encodeURIComponent(JSON.stringify(props));
          void Taro.navigateTo({
            url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
          });
        }}
        key={uniqueKeyUtil.nextKey()}
        type="inner"
      />
      <Comment
        onClick={(props) => {
          const serializedComment = encodeURIComponent(JSON.stringify(props));
          void Taro.navigateTo({
            url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
          });
        }}
        key={uniqueKeyUtil.nextKey()}
        type="inner"
      />
    </View>
  );
});

export default History;
