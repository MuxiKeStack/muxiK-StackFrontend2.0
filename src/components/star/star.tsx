import { Image, View } from '@tarojs/components';
import { useState } from 'react';
import './star.scss';

export default function Star(props) {
  const star0 = 'https://s2.loli.net/2023/08/29/NRLD54kzG9nEOHW.png';
  const star1 = 'https://s2.loli.net/2023/08/29/rENVFz7xU9n2bd6.png';

  const [stars, setStars] = useState([star0, star0, star0, star0, star0]);

  const starClick = (index: number) => {
    let newStars = [star0, star0, star0, star0, star0];
    for (var i = 0; i <= index; i++) {
      newStars[i] = star1;
    }
    setStars(newStars);
  };

  return (
    <View>
      {stars.map((star, index) => {
        return (
          <Image
            className="star"
            onClick={(e) => {
              starClick(index);
            }}
            src={star}
          ></Image>
        );
      })}
    </View>
  );
}
