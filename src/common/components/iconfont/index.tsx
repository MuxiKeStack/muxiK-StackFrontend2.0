/* tslint:disable */

import React, { FunctionComponent } from 'react';

export type IconNames = 'comment' | 'like' | 'wechat' | 'yanjing' | 'yanjing1' | 'xiaxue';

export interface IconProps {
  name: IconNames;
  size?: number;
  color?: string | string[];
  style?: React.CSSProperties;
}

const IconFont: FunctionComponent<IconProps> = () => {
  return null;
};

export default IconFont;
