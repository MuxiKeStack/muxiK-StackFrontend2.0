/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/rules-of-hooks */
import { Image, View } from '@tarojs/components';
import { useEffect, useState } from 'react';

import './showStar.scss';

export default function showStar(props) {
  const star2 = 'https://s2.loli.net/2023/08/29/rENVFz7xU9n2bd6.png';
  const star1 = 'https://s2.loli.net/2023/08/29/fB8wqj5mcQFiS7V.png';
  const star0 = 'https://s2.loli.net/2023/08/29/NRLD54kzG9nEOHW.png';

  const [starNum, setstarNum] = useState([star0, star0, star0, star0, star0]);

  const getStar = (num) => {
    const newStar = starNum.map(() => {
      const star = num >= 1 ? star2 : num > 0 ? star1 : star0;
      --num;
      return star;
    });
    setstarNum(newStar);
  };

  useEffect(() => {
    getStar(props.score);
  });

  return (
    <View className="score">
      {starNum.map((item, index) => {
        return <Image key={index} className="star" src={item} />;
      })}
    </View>
  );
}
