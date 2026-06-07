import { View } from '@tarojs/components';
import { CSSProperties } from 'react';

import './index.scss';

interface FeatrueLabelProps {
  id?: number | string;
  content: string;
  checked?: boolean;
  style?: CSSProperties;
  handleChecked?: (id: number | string) => void;
  handleClick?: () => void;
}

export default function FeatrueLabel({
  id,
  content,
  checked,
  style,
  handleChecked,
  handleClick,
}: FeatrueLabelProps) {
  const labelChecked = () => {
    id && handleChecked && handleChecked(id);
    handleClick && handleClick();
  };

  return (
    <View
      onClick={labelChecked}
      className="featureLabel"
      style={{
        ...style,
        backgroundColor: checked ? '#F9B94F' : '#ffffff',
        color: checked ? '#ffffff' : '#3D3D3D',
        borderColor: checked ? 'transparent' : '#CCCCCC',
      }}
    >
      {content}
    </View>
  );
}
