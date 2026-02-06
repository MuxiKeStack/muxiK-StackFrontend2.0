import { Loading as TaroLoading } from '@taroify/core';
import { Text, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

import { LoadingProps } from './type';

const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  size = 40,
  type = 'spinner',
  direction = 'vertical',
  containerStyle,
  textStyle,
  isCenter = true,
}) => {
  return (
    <View
      className={`loading-container ${isCenter ? 'loading-center' : 'loading-inline'}`}
      style={containerStyle}
    >
      <TaroLoading type={type} size={size} direction={direction} />
      <Text className="loading-text" style={textStyle}>
        {text}
      </Text>
    </View>
  );
};

export default Loading;
