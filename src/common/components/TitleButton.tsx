import { Button } from '@tarojs/components';
import { memo } from 'react';

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
        className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs text-[#f19900] ${isSelected ? 'border-[#F9CD57] bg-[#f19900] text-white' : 'border-[#C2C2C2] bg-gray-200 text-white'}`}
        disabled={isDisabled}
        onClick={onClick}
      >
        {title}
      </Button>
    );
  }
);

export default TitleButton;
