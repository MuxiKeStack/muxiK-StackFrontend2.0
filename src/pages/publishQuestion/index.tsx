import { Button, Image, Text, Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './style.scss';

import { Icon, TopBackground } from '@/common/assets/img/login';
import askicon from '@/common/assets/img/publishQuestion/ask.png';
import CourseInfo from '@/common/components/CourseInfo/CourseInfo';
import PublishHeader from '@/common/components/PublishHeader/PublishHeader';
import { formatIsoDate, get, post } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';

import { StatusResponse } from '../evaluate';

export interface UserInfo {
  avatarUrl: string; // 用户头像的URL
  nickName: string; // 用户昵称
}

export interface ResponseUser {
  code?: number;
  data: WebUserProfileVo;
  msg?: string;
}

export interface WebUserProfileVo {
  avatar: string;
  ctime: number;
  grade_sharing_is_signed?: boolean;
  id: number;
  /**
   * 是否为新用户，新用户尚未编辑过个人信息
   */
  new: boolean;
  nickname: string;
  studentId: string;
  title_ownership: { [key: string]: boolean };
  using_title: string;
  utime?: number;
}

const Page: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);

  // const courseId = 2347; //先用概率统计A来调试吧！
  const [courseId, setCourseId] = useState<string | null>(null);
  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      const params = instance?.router?.params || {};

      if (params.course_id) setCourseId(params.course_id);
    };

    getParams();
  }, []);

  //用户个人身份信息
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [nickName, setNickName] = useState<string>('昵称');
  const [test, setTest] = useState<boolean>(false);
  useEffect(() => {
    const getParams = async () => {
      try {
        const res = (await postBool('/checkStatus', {
          name: 'kestack',
        })) as StatusResponse;

        setTest(res.data.status);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    void getParams();
  }, []);
  useEffect(() => {
    console.log('test status updated:', test);
  }, [test]);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const getCourseData = async () => {
      try {
        void get(`/courses/${courseId}/detail`).then((res) => {
          // 检查 res 是否有 data 属性，并且断言其类型
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setCourse(res?.data as Course);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCourseData().then((r) => console.log(r));
  }, [courseId]); // 在courseId变化时运行

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = '/users/profile';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: ResponseUser = await get(url);
        if (
          typeof response?.data?.nickname == 'string' &&
          typeof response?.data?.avatar == 'string'
        ) {
          setNickName(response?.data?.nickname);
          setAvatarUrl(response?.data?.avatar);
        }
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    void fetchProfile();
  }, []); //仅在挂载时运行一次

  const [question, setQuestion] = useState<string>('');

  const countContent = (e) => {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { value } = e?.detail ?? {};
    if (typeof value === 'string') {
      setQuestion(value);
    } else {
      console.error('Expected a string but received a different type');
    }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    // const length = value.length;
    // setLength(length);
  };

  const postQuestion = () => {
    const questionobj = {
      biz: 'Course',
      biz_id: Number(courseId),
      content: question,
    };
    if (question.length === 0) {
      void Taro.showToast({
        title: '内容不能为空',
        icon: 'none',
      });
      return;
    }
    post(`/questions/publish`, questionobj)
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (res?.code === 0) {
          // 打印成功信息，但最好使用其他日志记录方式，而不是 console.log
          // 例如：this.setState({ message: '发布课评成功' });
          void Taro.showToast({ title: '发布问题成功', icon: 'success' });
          void Taro.navigateBack();
          // console.log('发布课评成功');
          // 使用 redirectTo 跳转
          // void Taro.redirectTo({
          //   url: '/pages/main/index', // 页面路径
          // });
        } else {
          // 处理其他响应代码，可能需要给用户一些反馈
          void Taro.showToast({ title: '发布课评失败', icon: 'none' });
        }
      })
      .catch((error) => {
        // 处理可能出现的错误情况
        void Taro.showToast({ title: '发布失败，请稍后重试', icon: 'none' });
        console.error('发布问题请求失败:', error);
      });
  };
  return !test ? (
    <View className="flex flex-col">
      <Image src={TopBackground as string} className="w-full"></Image>
      <View className="absolute top-0 mt-[15vh] flex w-full flex-col items-center gap-4">
        <View className="h-40 w-40 overflow-hidden rounded-2xl shadow-xl">
          <Image src={Icon as string} className="h-full w-full"></Image>
        </View>
        <Text className="text-3xl font-semibold tracking-widest text-[#FFD777]">
          木犀课栈
        </Text>
      </View>
    </View>
  ) : (
    <View>
      <CourseInfo name={course?.name} school={course?.school} teacher={course?.teacher} />
      <View className="publishView">
        <PublishHeader avatarUrl={avatarUrl} nickName={nickName} date={formatIsoDate()} />
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          <Image src={askicon} className="askicon"></Image>
        }
        <Textarea
          maxlength={450}
          onInput={countContent}
          placeholderStyle="font-size: 25rpx;"
          placeholder="关于课程你有什么要了解的？"
          className="quesionContent"
        ></Textarea>
      </View>
      <Button onClick={postQuestion} className="publishBtn">
        提交
      </Button>
    </View>
  );
};

export default Page;
