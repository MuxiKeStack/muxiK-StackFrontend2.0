import { Image, View } from '@tarojs/components';

import './index.scss';

// eslint-disable-next-line import/first
import Ask from '@/common/assets/img/publishQuestion/img.png';
// eslint-disable-next-line import/first
import { Answerv1Answer } from '@/common/types/userTypes';

interface Question {
  content: string;
  preview_answers: Array<Answerv1Answer>;
}
const AnswerToStudent: React.FC<Question> = (props) => {
  const { content, preview_answers } = props;
  return (
    <View className="question-container">
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Image src={Ask} className="img"></Image>
      <View>{content}</View>
      <View>{preview_answers.length}个回答</View>
    </View>
  );
};
export default AnswerToStudent;
