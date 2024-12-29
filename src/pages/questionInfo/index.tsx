/* eslint-disable no-console */
/* eslint-disable import/first */
import { Input, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import { AtFloatLayout } from 'taro-ui';

import './style.scss';

import CommentComponent from '@/common/components/CommentComponent/CommentComponent';
import CourseInfo from '@/common/components/CourseInfo/CourseInfo';
import QuestionDetail from '@/common/components/QuestionDetail/QuestionDetail';
import { get, post } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';

import { StatusResponse } from '../evaluate';

interface IQuestion {
  id: number;
  questioner_id: number;
  biz: string;
  biz_id: number;
  content: string;
  answer_cnt: number;
  preview_answers: null | Array<{
    id: number;
    publisher_id: number;
    question_id: number;
    content: string;
    utime: number;
    ctime: number;
  }>;
  utime: number;
  ctime: number;
}

interface IAnswer {
  id: number;
  publisher_id: number;
  question_id: number;
  content: string;
  stance: number;
  total_support_count: number;
  total_oppose_count: number;
  total_comment_count: number;
  utime: number;
  ctime: number;
}

interface ResponseType {
  code: number;
  data: number | CommentType[];
  msg: string;
}

const Page: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);

  const [question, setQuestion] = useState<IQuestion | null>(null);

  const [answers, setAnswers] = useState<IAnswer[] | null>(null);
  const [courseId, setCourseId] = useState<string>('');
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [test, setTest] = useState<boolean>(false);
  useEffect(() => {
    const getParams = async () => {
      try {
        const res = (await postBool('/checkStatus', {
          name: 'kestack',
        })) as StatusResponse;

        setTest(res.data.status);

        // const instance = Taro.getCurrentInstance();
        // const params = instance?.router?.params || {};

        // setId(params.id ? Number(params.id) : null);
        // setName(
        //   params.name ? decodeURIComponent(params.name) : '只能评价自己学过的课程哦'
        // );
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
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      const params = instance?.router?.params || {};

      if (params.id) setQuestionId(params.id);
      if (params.course_id) setCourseId(params.course_id);
    };

    getParams();
  }, []);

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

    if (courseId) void getCourseData();

    // eslint-disable-next-line @typescript-eslint/require-await
    const getQuestionDetail = async () => {
      try {
        void get(`/questions/${questionId}/detail`).then((res) => {
          // 检查 res 是否有 data 属性，并且断言其类型
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setQuestion(res?.data as IQuestion);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId && questionId) void getQuestionDetail().then((r) => console.log(r));

    // eslint-disable-next-line @typescript-eslint/require-await
    const getAnswersList = async () => {
      try {
        void get(
          `/answers/list/questions/${questionId}?cur_answer_id=${0}&limit=${100}`
        ).then((res) => {
          // 检查 res 是否有 data 属性，并且断言其类型
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setAnswers(res?.data as IAnswer[]);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId && questionId) void getAnswersList().then((r) => console.log(r));
  }, [courseId, questionId]); // 在courseId变化时运行

  const [currentAnswerId, setCurrentAnswerId] = useState<number | null>(null);
  const [isFloatLayoutVisible, setIsFloatLayoutVisible] = useState(false);

  // 处理浮动布局显示和隐藏的函数
  const handleFloatLayoutChange = (answerId: number | null) => {
    setCurrentAnswerId(answerId); // 更新当前回答的 ID
    setIsFloatLayoutVisible(answerId !== null); // 根据 answerId 是否为 null 来显示或隐藏浮动层
  };

  //浮动弹窗逻辑
  const [allComments, setAllComments] = useState<CommentType[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false); // 新增状态，标记评论是否已加载
  const [replyTo, setReplyTo] = useState<CommentType | null>(null); // 新增状态，存储被回复的评论
  const [replyContent, setReplyContent] = useState(''); // 存储回复内容
  const [placeholderContent, setplaceholderContent] = useState('写下你的评论...'); // 存储占位内容

  const [commentNum, setCommentNum] = useState<string | null>(null);

  // 将 fetchComments 函数移到 useEffect 外部
  const fetchComments = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const res: ResponseType = await get(
        `/comments/list?biz=Answer&biz_id=${currentAnswerId}&cur_comment_id=${0}&limit=${100}`
      );
      setAllComments(res?.data as CommentType[]);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('加载评论失败', error);
    }
  };

  useEffect(() => {
    const fetchCommentNum = async () => {
      // console.log(biz_id)
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res: ResponseType = await get(
          `/comments/count?biz=Answer&biz_id=${currentAnswerId}`
        );
        // console.log(res.data);
        setCommentNum(res?.data.toString());
      } catch (error) {
        console.error('加载评论数目失败', error);
      }
    };

    if (currentAnswerId !== null) {
      void fetchCommentNum();
      void fetchComments();
    }
  }, [currentAnswerId, commentsLoaded]); // 依赖项中添加biz_id

  const handleCommentClick = (comment: CommentType) => {
    setReplyTo(comment); // 设置回复目标
    setplaceholderContent(`回复给${comment.user?.nickname}: `); // 初始化回复内容
  };

  const handleReplyChange = (e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    setReplyContent(e.target.value as string);
  };

  const handleClearReply = () => {
    setReplyTo(null);
    setReplyContent('');
    setplaceholderContent('写下你的评论...');
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await post('/comments/publish', {
        biz: 'Answer',
        biz_id: currentAnswerId,
        content: replyContent,
        parent_id: replyTo?.id || 0,
        root_id:
          replyTo?.root_comment_id === 0 ? replyTo?.id : replyTo?.root_comment_id || 0,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (response?.code === 409002) {
        void Taro.showToast({
          title: '不能回答未上过的课',
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (response?.code === 0) {
        // 清空回复目标和输入框
        void Taro.showToast({
          title: '评论发布成功',
          icon: 'success',
          duration: 2000,
        });
        setReplyTo(null);
        setReplyContent('');
        setplaceholderContent('写下你的评论...');

        // 评论发布成功后，重新加载评论
        setCommentsLoaded(false);
        await fetchComments();

        void Taro.showToast({
          title: '评论发布成功',
          icon: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('评论发布失败:', error);
      void Taro.showToast({
        title: '评论发布失败',
        icon: 'error',
        duration: 2000,
      });
    }
  };

  return (
    <View className="relative min-h-screen pb-[120px]">
      <CourseInfo name={course?.name} school={course?.school} teacher={course?.teacher} />
      {question ? (
        <QuestionDetail
          question={question}
          answers={answers}
          handleFloatLayoutChange={handleFloatLayoutChange}
        />
      ) : (
        ''
      )}

      <View className="shadow-up fixed bottom-0 left-0 right-0 bg-[#f9f9f2]">
        <AtFloatLayout
          isOpened={isFloatLayoutVisible}
          title={`${commentNum}条回复`}
          onClose={() => handleFloatLayoutChange(null)}
        >
          <View onClick={handleClearReply} className="relative h-full pb-[60px]">
            {commentsLoaded && (
              <CommentComponent
                comments={allComments}
                onCommentClick={handleCommentClick}
              />
            )}
            <View className="fixed bottom-0 left-0 right-0 flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-3">
              <Input
                type="text"
                placeholder={placeholderContent}
                value={replyContent}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onInput={handleReplyChange}
                className="focus:border-primary h-10 flex-1 rounded-full border border-gray-300 px-4 text-sm focus:outline-none"
              />
              <View
                className="rounded-full bg-[#f18900] px-4 py-2 text-sm text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleReplySubmit();
                }}
              >
                发布
              </View>
            </View>
          </View>
        </AtFloatLayout>
      </View>
    </View>
  );
};

export default Page;
