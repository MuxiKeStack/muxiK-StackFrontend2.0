/* eslint-disable import/first */
import { Input, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';
import { AtFloatLayout } from 'taro-ui';

import './index.scss';

import { Course } from '@/common/assets/types';
import CommentComponent from '@/common/components/CommentComponent/CommentComponent';
import CourseInfo from '@/common/components/CourseInfo/CourseInfo';
import QuestionDetail from '@/common/components/QuestionDetail/QuestionDetail';
import { get, post } from '@/common/utils/fetch';

import { Comment as CommentType } from '../../common/assets/types';

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

const Index: React.FC = () => {
  // const question = {
  //   id: 5,
  //   questioner_id: 5208,
  //   biz: 'Course',
  //   biz_id: 2347,
  //   content: '这节课怎么样？',
  //   answer_cnt: 0,
  //   preview_answers: null,
  //   utime: 1725039765090,
  //   ctime: 1725039765090,
  // };

  // const answers = [
  //   {
  //     id: 5,
  //     publisher_id: 5208,
  //     question_id: 5,
  //     content: '我觉得很不错',
  //     stance: 0,
  //     total_support_count: 0,
  //     total_oppose_count: 0,
  //     total_comment_count: 0,
  //     utime: 1725039834700,
  //     ctime: 1725039834700,
  //   },
  // ];

  const [course, setCourse] = useState<Course | null>(null);

  const [question, setQuestion] = useState<IQuestion | null>(null);

  const [answers, setAnswers] = useState<IAnswer[] | null>(null);

  const courseId = 2347; //先用概率统计A来调试吧
  const [questionId, setQuestionId] = useState<string | null>(null);

  // const questionId = 5;

  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      // 使用可选链操作符安全访问 router 和 params
      const params = instance?.router?.params || {};

      if (params.id) setQuestionId(params.id);
    };

    getParams();
  }, []); // 这个 effect 仅在组件挂载时运行一次

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const getCourseData = async () => {
      try {
        void get(`/courses/${courseId}/detail`, true).then((res) => {
          console.log(res);
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

    // eslint-disable-next-line @typescript-eslint/require-await
    const getQuestionDetail = async () => {
      try {
        void get(`/questions/${questionId}/detail`, true).then((res) => {
          console.log(res);
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
          `/answers/list/questions/${questionId}?cur_answer_id=0&limit=100`,
          true
        ).then((res) => {
          console.log(res);
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

  useEffect(() => {
    // const handleQuery = () => {
    //   const query = Taro.getCurrentInstance()?.router?.params; // 获取查询参数
    //   const serializedComment = query?.comment;
    //   if (serializedComment) {
    //     try {
    //       // 解析字符串
    //       const parsedComment = JSON.parse(decodeURIComponent(serializedComment));
    //       setComment(parsedComment);
    //       setBiz_id(parsedComment.id);
    //     } catch (error) {
    //       console.error('解析评论参数失败', error);
    //     }
    //   }
    // };

    // handleQuery();

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

    // 确保 biz_id 设置后再调用 fetchComments
    if (currentAnswerId !== null) {
      console.log(1);
      void fetchCommentNum();
    }

    const fetchComments = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const res: ResponseType = await get(
          `/comments/list?biz=Answer&biz_id=${currentAnswerId}&cur_comment_id=0&limit=100`
        );
        setAllComments(res?.data as CommentType[]);
        setCommentsLoaded(true);
      } catch (error) {
        console.error('加载评论失败', error);
      }
    };

    // 确保 biz_id 设置后再调用 fetchComments
    if (currentAnswerId !== null) {
      void fetchComments();
    }
  }, [currentAnswerId, commentsLoaded]); // 依赖项中添加biz_id

  const handleCommentClick = (comment: CommentType) => {
    console.log(comment);
    setReplyTo(comment); // 设置回复目标
    setplaceholderContent(`回复给${comment.user?.nickname}: `); // 初始化回复内容
  };

  const handleReplyChange = (e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    setReplyContent(e.target.value as string);
  };

  const handleClearReply = () => {
    console.log(2);
    setReplyTo(null);
    setReplyContent('');
    setplaceholderContent('写下你的评论...');
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return; // 忽略空内容

    try {
      await post('/comments/publish', {
        biz: 'Answer',
        biz_id: currentAnswerId,
        content: replyContent,
        parent_id: replyTo?.id || 0,
        root_id:
          replyTo?.root_comment_id === 0 ? replyTo?.id : replyTo?.root_comment_id || 0,
      });
      console.log('评论发布成功');

      // 清空回复目标和输入框
      setReplyTo(null);
      setReplyContent('');
      setplaceholderContent('写下你的评论...');

      // 评论发布成功后，重新加载评论
      setCommentsLoaded(false); // 先将commentsLoaded设为false，避免useEffect中的fetchComments不被调用
      const fetchComments = async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const res: ResponseType = await get(
            `/comments/list?biz=Answer&biz_id=${currentAnswerId}&cur_comment_id=0&limit=100`
          );
          setAllComments(res.data as CommentType[]);
          setCommentsLoaded(true);
        } catch (error) {
          console.error('加载评论失败', error);
        }
      };
      await fetchComments();
    } catch (error) {
      console.error('评论发布失败', error);
    }
  };

  return (
    <View>
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

      <View className="panel">
        <View className="panel__content">
          {/* AtFloatLayout 组件 */}
          <AtFloatLayout
            isOpened={isFloatLayoutVisible}
            title={`${commentNum}条回复`}
            onClose={() => handleFloatLayoutChange(null)}
          >
            <View onClick={handleClearReply}>
              {/* 这里是浮动弹层的内容 */}
              {commentsLoaded && (
                <CommentComponent
                  comments={allComments}
                  onCommentClick={handleCommentClick}
                />
              )}
              <View className="reply-input">
                <Input
                  type="text"
                  placeholder={placeholderContent}
                  value={replyContent}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onInput={handleReplyChange}
                  onConfirm={void handleReplySubmit}
                />
              </View>
            </View>
          </AtFloatLayout>
        </View>
      </View>
    </View>
  );
};

export default Index;
