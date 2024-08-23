import { Button } from '@tarojs/components';

import '../titleButton/titleButton.scss';

export interface TitleButtonProps {
  title: string;
}
const TitleButton = ({ title }: TitleButtonProps) => {
  return <Button className="title-button">{title}</Button>;
};
export default TitleButton;
