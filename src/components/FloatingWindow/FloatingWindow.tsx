/* eslint-disable react/jsx-key */
import { Swiper, SwiperItem, View } from '@tarojs/components';

import './index.scss';

type FloatingWindowProps = object;

const FloatingWindow: React.FC<FloatingWindowProps> = () => {
  const pages = [<Page1 />, <Page2 />, <Page3 />, <Page4 />];

  return (
    <View className="floating_window_background">
      <Swiper
        className="floating_window_content"
        indicatorColor="#999"
        indicatorActiveColor="#333"
        circular
        indicatorDots
      >
        {pages.map((page, index) => (
          <SwiperItem key={index} className="floating_window_slide">
            {page}
          </SwiperItem>
        ))}
      </Swiper>
    </View>
  );
};

const Page1 = () => {
  return <View>1</View>;
};

const Page2 = () => {
  return <View>2</View>;
};

const Page3 = () => {
  return <View>3</View>;
};

const Page4 = () => {
  return <View>4</View>;
};

export default FloatingWindow;
