import { View } from '@tarojs/components';
import React, { useState } from 'react';
import './index.scss';

export type FloatButtonProps = {
  icon?: React.ReactNode;
  content?: React.ReactNode;
  shape?: 'circle' | 'square';
  side?: 'left' | 'right';
  verticalOffset?: number | string;
  horizontalOffset?: number | string;
  halfHidden?: boolean;
  styles?: React.CSSProperties | ((props: FloatButtonProps) => React.CSSProperties);
  onClick?: (e: any) => void;
};

const FloatButton: React.FC<FloatButtonProps> = (props) => {
  const {
    icon,
    content,
    shape = 'circle',
    side = 'right',
    verticalOffset = '70%',
    horizontalOffset = 0,
    halfHidden = false,
    styles,
    onClick,
  } = props;

  const [active, setActive] = useState(false);

  const getOffset = (value?: number | string) => {
    if (typeof value === 'number') return `${value}rpx`;
    return value;
  };

  const top = getOffset(verticalOffset);
  const sideValue = halfHidden ? '0rpx' : getOffset(horizontalOffset);
  const computedStyle = typeof styles === 'function' ? styles(props) : styles;

  const transformX = halfHidden
    ? side === 'right'
      ? active
        ? 'translateX(0)'
        : 'translateX(50%)'
      : active
        ? 'translateX(0)'
        : 'translateX(-50%)'
    : 'translateX(0)';

  return (
    <View
      className={`floatButton_container floatButton_${shape}`}
      style={{
        top,
        [side]: sideValue,
        transform: transformX,
        opacity: halfHidden && !active ? 0.6 : 1,
        borderColor: active ? '#eda335' : 'transparent',
        ...computedStyle,
      }}
      onClick={onClick}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      onTouchCancel={() => setActive(false)}
    >
      {icon && <View className="floatButton_icon">{icon}</View>}
      {content && <View className="floatButton_content">{content}</View>}
    </View>
  );
};

export default FloatButton;
