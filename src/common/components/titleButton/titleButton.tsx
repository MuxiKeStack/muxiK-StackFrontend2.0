import { Button } from '@tarojs/components';

import '../titleButton/titleButton.scss';

interface TitleButtonProps {
  title: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

const TitleButton = ({ title, isSelected, isDisabled, onClick }: TitleButtonProps) => {
  return (
    <Button
      className={`title-button ${isSelected ? 'selected' : ''}`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {title}
    </Button>
  );
};

export default TitleButton;
