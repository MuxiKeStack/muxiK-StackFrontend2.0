import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';

// eslint-disable-next-line import/first
import { post } from '@/common/utils';

const ShareGrades = () => {
  const handleSubmit = () => {
    try {
      void post('/grades/sign', { wants_to_sign: true }, true).then((r) => {
        console.log(r);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (r.msg === '重复签约') {
          void Taro.showToast({
            icon: 'error',
            title: '请勿重复签约',
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (r.msg === '签约成功') {
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
    <View>
      <Text className="title">成绩共享计划</Text>
      <View className="card">
        该部分的课程成绩信息是我们在征得用户同意后，
        <Text className="font-extrabold">匿名</Text>
        收集用户成绩数据所得到的统计结果。查看该信息需要您加入我们的 课程成绩共享计划
        ，提供自己的过往成绩信息作为数据分析的一部分。我们将根据隐私条例中的内容，保证您的个人信息受到安全保护。
      </View>
      <Button onClick={handleSubmit}>我同意成绩共享计划</Button>
    </View>
  );
};
export default ShareGrades;
