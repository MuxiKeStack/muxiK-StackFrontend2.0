import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';

// eslint-disable-next-line import/first
import { post } from '@/common/utils';

const ShareGrades = () => {
  const handleSubmit = () => {
    try {
      void post('/grades/sign', { wants_to_sign: true }).then((r) => {
        console.log(r);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (r.msg === '重复签约') {
          void Taro.showToast({
            icon: 'error',
            title: '请勿重复签约',
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (r.msg === 'success') {
          void Taro.showToast({
            icon: 'success',
            title: '签约成功！',
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View className="flex min-h-screen flex-col items-center bg-gray-50 p-6">
      <Text className="mb-4 text-2xl font-bold text-gray-800">成绩共享计划</Text>
      <View className="fontSize-[35rpx] m-[10vh] mb-6 w-[80vw] rounded-lg bg-white p-4 text-center text-gray-600 shadow-lg">
        <Text>该部分的课程成绩信息是我们在征得用户同意后，</Text>
        <Text className="font-extrabold text-black">匿名</Text>
        <Text>
          收集用户成绩数据所得到的统计结果。查看该信息需要您加入我们的课程成绩共享计划，
          提供自己的过往成绩信息作为数据分析的一部分。我们将根据隐私条例中的内容，保证您的个人信息受到安全保护。
        </Text>
      </View>
      <Button
        className="rounded-md bg-[#ffd777] px-4 py-4 font-semibold text-white transition-all"
        onClick={handleSubmit}
      >
        我同意成绩共享计划
      </Button>
    </View>
  );
};
export default ShareGrades;
