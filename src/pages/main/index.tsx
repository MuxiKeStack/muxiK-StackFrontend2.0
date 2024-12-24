/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/first */
import { Image, ScrollView, Text, View } from '@tarojs/components';

import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';

import './index.scss';

import { Icon, TopBackground } from '@/common/assets/img/login';
import { Comment } from '@/common/components';
import SearchInput from '@/common/components/SearchInput/SearchInput';
import { postBool } from '@/common/utils/fetch';

import { StatusResponse } from '../evaluate/evaluate';
import { useCourseStore } from './store/store';
import { COURSE_TYPE } from './store/types';

const COURSE_NAME_MAP = {
  [COURSE_TYPE.ANY]: '全部',
  [COURSE_TYPE.MAJOR]: '专业',
  [COURSE_TYPE.GENERAL_ELECT]: '个性',
  [COURSE_TYPE.GENERAL_CORE]: '通核',
};

export default function Index() {
  const handleSearchToggle = () => {
    // console.log(isSearchActive);
    void Taro.navigateTo({
      url: '/pages/research/research',
    });
  };
  const [refresherTriggered, setRefresherTriggered] = useState(false);

  // const [comments, setComments] = useState<CommentInfoType[]>([]);
  const comments = useCourseStore((state) => state.comments);
  const classType = useCourseStore((state) => state.classType);
  const loading = useCourseStore((state) => state.loading);
  const dispatch = useCourseStore(
    ({ loadMoreComments, refershComments, changeType }) => ({
      loadMoreComments,
      refershComments,
      changeType,
    })
  );

  useEffect(() => {
    void dispatch.loadMoreComments();
  }, [dispatch.loadMoreComments]);

  const handleChangeType = (type) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    dispatch.changeType(type);
    void dispatch.refershComments();
  };
  useEffect(() => {
    if (!comments[classType].length) {
      void Taro.showLoading({ title: '加载中' });
      void dispatch
        .refershComments()
        .then(() => {
          Taro.hideLoading();
        })
        .catch(() => {
          Taro.hideLoading();
          void Taro.showToast({ title: '加载失败', icon: 'none' });
        });
    }
  }, [classType]);

  useDidShow(() => {
    void dispatch
      .refershComments()
      .then(() => {
        Taro.hideLoading();
      })
      .catch(() => {
        Taro.hideLoading();
        void Taro.showToast({ title: '加载失败', icon: 'none' });
      });
  });

  const handleSearch = (searchText: string) => {
    console.log('搜索文本:', searchText);
  };
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
  const geneHandler = () => {
    let timeNow = Date.now();
    return (e) => {
      if (
        !useCourseStore.getState().loading &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        e.detail.scrollTop > e.detail.scrollHeight / 2 &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        e.detail.deltaY < 0 &&
        Date.now() - timeNow > 1000
      ) {
        void dispatch.loadMoreComments();
        timeNow = Date.now();
      }
    };
  };
  const handleComment = useCallback((props) => {
    const serializedComment = encodeURIComponent(JSON.stringify(props));
    void Taro.navigateTo({
      url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
    });
  }, []);
  const loadMoreHandler = useMemo(() => {
    return geneHandler();
  }, [loading]);

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
        <View className="mt-8 w-4/5">
          <View className="rounded-lg bg-white p-4 shadow-md">
            <Text className="mb-4 text-lg font-medium">功能介绍</Text>
            <View className="flex flex-col gap-3">
              {['查询课程信息', '教师评分反馈'].map((item, index) => (
                <View key={index} className="flex items-center">
                  <View className="mr-2 h-2 w-2 rounded-full bg-[#FFD777]" />
                  <Text className="text-gray-600">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  ) : (
    <View className="flex flex-col">
      <SearchInput
        onSearch={handleSearch} // 传递搜索逻辑
        onSearchToggle={handleSearchToggle}
        disabled
        searchPlaceholder="搜索课程名/老师名"
        searchPlaceholderStyle="color:#9F9F9C"
        searchIconSrc="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
      />
      <View className="classLine">
        {Object.entries(COURSE_NAME_MAP).map(([name, displayName]) => {
          return (
            <>
              <View
                className={'label' + ' ' + (classType === name ? 'active' : '')}
                onClick={() => handleChangeType(name)}
              >
                {displayName}
              </View>
            </>
          );
        })}
      </View>
      <ScrollView
        refresherEnabled
        style={{ height: '70vh' }}
        refresherTriggered={refresherTriggered}
        scrollY
        onScroll={(e) => loadMoreHandler(e)}
        onRefresherRefresh={() => {
          setRefresherTriggered(true);
          void dispatch.refershComments().then(() => {
            setRefresherTriggered(false);
          });
        }}
      >
        {comments[classType] &&
          comments[classType].map((comment) => (
            <>
              <Comment
                onCommentClick={() => handleComment({ ...comment, type: 'inner' })}
                onClick={() => handleComment({ ...comment, type: 'inner' })}
                key={comment.id} // 使用唯一key值来帮助React识别哪些元素是不同的
                {...comment} // 展开comment对象，将属性传递给Comment组件
                type="inner" // 固定属性，不需要从数组中获取
              />
              <View className="h-4 w-full"></View>
            </>
          ))}
      </ScrollView>
    </View>
  );
}
