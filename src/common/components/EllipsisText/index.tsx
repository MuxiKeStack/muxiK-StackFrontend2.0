import { Text } from '@tarojs/components';
import { ReactNode } from 'react';

import './index.scss';

interface EllipsisTextProps {
  children: ReactNode;
  className?: string;
  lines?: number;
}

export default function EllipsisText({
  children,
  className,
  lines = 1,
}: EllipsisTextProps) {
  if (lines <= 1) {
    return (
      <Text className={`ellipsis_text ${className || ''}`} overflow="ellipsis">
        {children}
      </Text>
    );
  }

  return (
    <Text
      className={`ellipsis_text clamp_${lines} ${className || ''}`}
      numberOfLines={lines}
    >
      {children}
    </Text>
  );
}
