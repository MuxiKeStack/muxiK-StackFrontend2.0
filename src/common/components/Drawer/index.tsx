import { Text, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

interface DrawerProps {
  isOpened: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  mode?: 'bottom' | 'side';
  side?: 'left' | 'right';
  height?: string | number;
  width?: string | number;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpened,
  onClose,
  title,
  children,
  mode = 'bottom',
  side = 'right',
  height = '70vh',
  width = '70vw',
}) => {
  const getContentStyle = (): React.CSSProperties => {
    if (mode === 'bottom') {
      return { height };
    } else {
      return { width, height: '100%' };
    }
  };

  return (
    <>
      <View
        className={`drawer_mask ${isOpened ? 'drawer_mask_show' : ''}`}
        onClick={onClose}
      />

      <View
        className={`drawer_content drawer_content_${mode} ${side === 'left' ? 'drawer_content_left' : 'drawer_content_right'} ${isOpened ? 'drawer_content_show' : ''} `}
        style={getContentStyle()}
      >
        <View className="drawer_header">
          <Text className="drawer_title">{title || '提示'}</Text>
          <Text className="drawer_close" onClick={onClose}>
            X
          </Text>
        </View>
        <View className="drawer_body">{children}</View>
      </View>
    </>
  );
};

export default Drawer;
