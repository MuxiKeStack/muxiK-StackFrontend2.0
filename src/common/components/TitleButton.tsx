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
        className={`whitespace-nowrap px-2 py-1 text-xs text-[#f19900] shadow-lg ${isSelected ? 'bg-[#f19900] text-white' : 'bg-gray-200 text-white'}`}
        disabled={isDisabled}
        onClick={onClick}
      >
        {title}
      </Button>
    );
  }
);

export default TitleButton;
