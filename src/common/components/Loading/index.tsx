import { Loading as TaroLoading } from '@taroify/core';
import { Text, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

export interface LoadingProps {
  text?: string;
  type?: 'circular' | 'spinner';
  direction?: 'horizontal' | 'vertical';
  size?: number | string;
  containerStyle?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  isCenter?: boolean;
  showMask?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  size = 40,
  type = 'spinner',
  direction = 'vertical',
  containerStyle,
  textStyle,
  isCenter = true,
  showMask = false,
}) => {
  return (
    <View
      className={`loading_wrapper ${isCenter ? 'loading_center' : 'loading_inline'} ${showMask ? 'loading_overlay' : ''}`}
    >
      <View className="loading_container" style={containerStyle}>
        <TaroLoading type={type} size={size} direction={direction} />
        <Text className="loading_text" style={textStyle}>
          {text}
        </Text>
      </View>
    </View>
  );
};

export default Loading;
