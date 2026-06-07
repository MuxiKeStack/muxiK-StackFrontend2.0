import { Button, Text } from '@tarojs/components';
import { memo } from 'react';

import './index.scss';

interface TitleButtonProps {
  title: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

const TitleButton: React.FC<TitleButtonProps> = memo(
  ({ title, isSelected, isDisabled, onClick }) => {
    return (
      <Button
        className={`title_button ${isSelected ? 'title_button_selected' : ''}`}
        disabled={isDisabled}
        onClick={onClick}
      >
        <Text
          className={`title_button_text ${isSelected ? 'title_button_selected_text' : ''}`}
        >
          {title}
        </Text>
      </Button>
    );
  }
);

export default TitleButton;
