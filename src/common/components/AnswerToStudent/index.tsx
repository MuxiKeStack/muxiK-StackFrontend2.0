import { Image, View } from '@tarojs/components';

import Ask from '@/common/assets/img/publishQuestion/img.png';

interface Question {
  content: string;
  preview_answers: Array<Answerv1Answer>;
}

const AnswerToStudent: React.FC<Question> = (props) => {
  const { content, preview_answers } = props;
  return (
    <View className="m-auto flex h-[4vh] w-[80vw] items-center justify-center gap-2">
      <Image src={Ask as string} className="h-6 w-6" />
      <View className="text-base font-medium text-gray-800">{content}</View>
      <View className="ml-auto text-sm text-gray-500">
        {preview_answers?.length ?? 0} 个回答
      </View>
    </View>
  );
};

export default AnswerToStudent;
