/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/first */
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';

import './index.scss';

import { GuildLine } from '@/common/components';
import Comment from '@/common/components/comment/comment';
import SearchInput from '@/common/components/SearchInput/SearchInput';
import { get, postLogin } from '@/common/utils/fetch';

import { CommentInfoType } from '../../common/assets/types';

type CourseDetailsType = {
  class_name: string;
  teacher: string;
};

type UserDetailsType = {
  nickname: string;
  avatar: string;
};

export default function Index() {
  const handleSearchToggle = () => {
    // console.log(isSearchActive);
    void Taro.navigateTo({
      url: '/pages/research/research',
    });
  };

  const [comments, setComments] = useState<CommentInfoType[]>([]);

  // 修改 fetchCourseDetails 函数以返回正确的类型
  async function fetchCourseDetails(courseId: number): Promise<CourseDetailsType> {
    try {
      // 使用 await 等待 Promise 的结果
      const response = await get(`/courses/${courseId}/simple_detail`);
      // 检查响应是否成功
      if (!response || !response.data) {
        throw new Error('Invalid response data');
      }
      // 确保返回的数据结构符合 CourseDetailsType 类型
      return {
        class_name: response.data.name,
        teacher: response.data.teacher,
      };
    } catch (error) {
      // 抛出错误，以便调用者可以使用 .catch() 处理它
      throw error;
    }
  }

  async function fetchUserDetails(User: number): Promise<UserDetailsType> {
    try {
      // 使用 await 等待 Promise 的结果
      const response = await get(`/users/${User}/profile`);
      // 检查响应是否成功
      if (!response || !response.data) {
        throw new Error('Invalid response data');
      }
      // 确保返回的数据结构符合 UserDetailsType 类型
      return {
        nickname: response.data.nickname,
        avatar: response.data.avatar,
      };
    } catch (error) {
      // 抛出错误，以便调用者可以使用 .catch() 处理它
      throw error;
    }
  }

  // 定义一个函数来处理数据并返回新的数组
  async function processData(data) {
    const processedData: CommentInfoType[] = [];

    for (const item of data) {
      try {
        // 根据 course_id 获取课程详情
        const courseDetails = await fetchCourseDetails(item.course_id);
        const userDetails = await fetchUserDetails(item.publisher_id);
        // 创建新的 object 并添加到数组中
        processedData.push({
          id: item.id,
          content: item.content,
          ...courseDetails, // 包含 name, teacher
          ...userDetails, //包含 avatar,nickname
          star_rating: item.star_rating,
          total_support_count: item.total_support_count || 0, // 如果没有则默认为0
          total_oppose_count: item.total_oppose_count || 0,
          total_comment_count: item.total_comment_count || 0,
          utime: item.utime,
          ctime: item.ctime,
        });
      } catch (error) {
        console.error('获取课程详情失败:', error);
      }
    }

    return processedData;
  }

  const getData = useCallback(
    (type) => {
      let classType = 'CoursePropertyMajorCore';
      switch (type) {
        case 1:
          classType = 'CoursePropertyMajorCore';
          break;
        case 2:
          classType = 'CoursePropertyGeneralElective';
          break;
        case 3:
          classType = 'CoursePropertyGeneralCore';
          break;
        case 4:
          classType = 'CoursePropertyGeneralRequired';
          break;
      }
      console.log(classType);
      postLogin(
        '/users/login_ccnu',
        {
          student_id: '2022214276',
          password: 'Maggie1029',
        },
        false
      ).then((res) => {
        const customHeaderValue = res['X-Jwt-Token'];
        // console.log(res);
        // console.log(customHeaderValue);
        Taro.setStorage({ key: 'token', data: customHeaderValue });
        console.log('登录成功');
        get(
          `/evaluations/list/all?cur_evaluation_id=0&limit=10&property=${classType}`
        ).then((res1) => {
          // console.log(res.data);
          if (res1.code == 0) {
            processData(res1.data)
              .then((newData) => {
                setComments(newData);
              })
              .catch((error) => {
                console.error('处理数据时发生错误:', error);
              });
          }
        });
      });
    },
    [processData]
  );

  useEffect(() => {
    getData(1);
  }, [getData]);

  const [classType, setClassType] = useState(1);

  const handleClick = (type) => {
    setClassType(type);
    getData(type);
  };

  const handleSearch = (searchText: string) => {
    console.log('搜索文本:', searchText);
    // 这里可以添加发送API请求的代码
    // 例如: fetchSearchResults(searchText);
  };

  const handleCommentClick = (comment: CommentInfoType) => {
    console.log(comment);
    // 序列化对象
    const serializedComment = encodeURIComponent(JSON.stringify(comment));
    Taro.navigateTo({
      url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
    });
  };

  return (
    <View className="main">
      <SearchInput
        onSearch={handleSearch} // 传递搜索逻辑
        onSearchToggle={handleSearchToggle}
        searchPlaceholder="搜索课程名/老师名"
        searchPlaceholderStyle="color:#9F9F9C"
        searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
      />
      <View className="classLine">
        <View
          className={'label' + ' ' + (classType == 1 ? 'active' : '')}
          onClick={() => {
            return handleClick(1);
          }}
        >
          专业
        </View>
        <View
          className={'label' + ' ' + (classType == 2 ? 'active' : '')}
          onClick={() => {
            return handleClick(2);
          }}
        >
          通选
        </View>
        <View
          className={'label' + ' ' + (classType == 3 ? 'active' : '')}
          onClick={() => {
            return handleClick(3);
          }}
        >
          通核
        </View>
        <View
          className={'label' + ' ' + (classType == 4 ? 'active' : '')}
          onClick={() => {
            return handleClick(4);
          }}
        >
          通必
        </View>
      </View>

      {comments.map((comment) => (
        <Comment
          key={comment.id} // 使用唯一key值来帮助React识别哪些元素是不同的
          {...comment} // 展开comment对象，将属性传递给Comment组件
          type="inner" // 固定属性，不需要从数组中获取
          onClick={() => handleCommentClick(comment)}
        />
      ))}

      <GuildLine />
    </View>
  );
}
