/* eslint-disable react/jsx-key */

import { Image, View } from '@tarojs/components';
import { useState } from 'react';

import './star.scss';

interface Props {
  onStarClick: (index: number) => void;
  // ...其他属性...
}

const Star: React.FC<Props> = ({ onStarClick }) => {
  const star0 = 'https://s2.loli.net/2023/08/29/NRLD54kzG9nEOHW.png';
  const star1 = 'https://s2.loli.net/2023/08/29/rENVFz7xU9n2bd6.png';

  const [stars, setStars] = useState([star0, star0, star0, star0, star0]);

  const starClick = (index: number) => {
    const newStars = [star0, star0, star0, star0, star0];
    for (let i = 0; i <= index; i++) {
      newStars[i] = star1;
    }
    setStars(newStars);
    onStarClick(index); // 安全调用
  };

  return (
    <View>
      {stars.map((star, index) => {
        return (
          <Image
            className="star"
            onClick={() => {
              starClick(index);
            }}
            src={star}
          ></Image>
        );
      })}
    </View>
  );
};

export default Star;
