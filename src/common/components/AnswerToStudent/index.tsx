import { Image, View } from '@tarojs/components';

import './index.scss';

// eslint-disable-next-line import/first
import Ask from '@/common/assets/img/publishQuestion/img.png';

function AnswerToStudent() {
  return (
    <View className="question-container">
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Image src={Ask} className="img"></Image>
      <View>问题问题问题问题问题:</View>
      <View>1个回答</View>
    </View>
  );
}
export default AnswerToStudent;
