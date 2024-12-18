/* eslint-disable */
import React, { FunctionComponent } from 'react';

interface Props {
  name:
    | 'guanfangbanben'
    | 'tiwen'
    | 'comment'
    | 'like'
    | 'wechat'
    | 'yanjing'
    | 'yanjing1'
    | 'xiaxue'
    | 'edit';
  size?: number;
  color?: string | string[];
  style?: React.CSSProperties;
}

declare const IconFont: FunctionComponent<Props>;

export default IconFont;
