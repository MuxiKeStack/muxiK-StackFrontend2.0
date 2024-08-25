import { Button } from '@tarojs/components';

import '../titleButton/titleButton.scss';

interface TitleButtonProps {
  title: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}
const TitleButton = ({ title }: TitleButtonProps) => {
  return <Button className="title-button">{title}</Button>;
};
export default TitleButton;
