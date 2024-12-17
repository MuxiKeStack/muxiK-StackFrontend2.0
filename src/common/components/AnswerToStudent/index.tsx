import { Image, View } from '@tarojs/components';

import Ask from '@/common/assets/img/publishQuestion/img.png';

interface Question {
  content: string;
  preview_answers: Array<Answerv1Answer>;
}

const AnswerToStudent: React.FC<Question> = (props) => {
  const { content, preview_answers } = props;
  return (
    <View className="flex min-h-[2vh] w-[80vw] items-center justify-start rounded-lg bg-white p-3 hover:bg-gray-50">
      <Image src={Ask as string} className="h-5 w-5 flex-shrink-0" />
      <View className="mx-3 line-clamp-2 flex-1 text-base font-medium text-gray-800">
        {content}
      </View>
      <View className="flex-shrink-0 text-sm font-medium text-gray-500">
        {preview_answers.length} 个回答
      </View>
    </View>
  );
};

export default AnswerToStudent;
