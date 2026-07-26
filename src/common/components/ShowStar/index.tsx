import { Image, View } from '@tarojs/components';
import { useEffect, useState } from 'react';

import './index.scss';

interface ShowStarProps {
  score: number;
}

const STAR_FULL = 'https://s2.loli.net/2023/08/29/rENVFz7xU9n2bd6.png';
const STAR_HALF = 'https://s2.loli.net/2023/08/29/fB8wqj5mcQFiS7V.png';
const STAR_EMPTY = 'https://s2.loli.net/2023/08/29/NRLD54kzG9nEOHW.png';

const ShowStar: React.FC<ShowStarProps> = ({ score }) => {
  const [starNum, setStarNum] = useState([
    STAR_EMPTY,
    STAR_EMPTY,
    STAR_EMPTY,
    STAR_EMPTY,
    STAR_EMPTY,
  ]);

  useEffect(() => {
    let remaining = score;
    setStarNum(
      Array.from({ length: 5 }, () => {
        const star = remaining >= 1 ? STAR_FULL : remaining > 0 ? STAR_HALF : STAR_EMPTY;
        remaining -= 1;
        return star;
      })
    );
  }, [score]);

  return (
    <View className="score">
      {starNum.map((item, index) => (
        <Image key={index} className="star" src={item} />
      ))}
    </View>
  );
};

export default ShowStar;
