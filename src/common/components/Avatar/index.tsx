import { Image, View } from '@tarojs/components';
import { memo } from 'react';

import type { AvatarFrame } from '@/common/utils';
import { resolveAvatarFrame } from '@/common/utils';

import './index.scss';

interface AvatarProps {
  src: string;
  size?: number | string;
  username?: string;
  frame?: AvatarFrame;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = memo(
  ({ src, size = 48, username, frame, className = '', onClick }) => {
    const resolvedFrame = frame ?? resolveAvatarFrame(username);
    const sizeValue = typeof size === 'number' ? `${size}rpx` : size;

    return (
      <View className={`avatar_root ${className}`} onClick={onClick}>
        <View
          className={`avatar_frame avatar_frame_${resolvedFrame}`}
          style={{ width: sizeValue, height: sizeValue }}
        >
          <Image src={src || ''} className="avatar_img" mode="aspectFill" />
        </View>
      </View>
    );
  }
);

export default Avatar;
