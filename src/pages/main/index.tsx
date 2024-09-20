/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/first */
import { ScrollView, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useMemo } from 'react';

import './index.scss';

import { Comment } from '@/common/components';
import SearchInput from '@/common/components/SearchInput/SearchInput';

import { useCourseStore } from './store/store';
import { COURSE_TYPE } from './store/types';

const COURSE_NAME_MAP = {
  [COURSE_TYPE.MAJOR]: '专业',
  [COURSE_TYPE.GENERAL_ELECT]: '通选',
  [COURSE_TYPE.GENERAL_REQUIRED]: '通必',
  [COURSE_TYPE.GENERAL_CORE]: '通核',
};

export default function Index() {
  const handleSearchToggle = () => {
    // console.log(isSearchActive);
    void Taro.navigateTo({
      url: '/pages/research/research',
    });
  };

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
  };

  useEffect(() => {
    void (!comments[classType].length && dispatch.refershComments());
  }, [classType]);

  const handleSearch = (searchText: string) => {
    console.log('搜索文本:', searchText);
    // 这里可以添加发送API请求的代码
    // 例如: fetchSearchResults(searchText);
  };

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(e.detail);
        void dispatch.loadMoreComments();
        timeNow = Date.now();
      }
    };
  };

  const loadMoreHandler = useMemo(() => {
    return geneHandler();
  }, [loading]);

  return (
    <View className="h-screen pb-[35vh]">
      <SearchInput
        onSearch={handleSearch} // 传递搜索逻辑
        onSearchToggle={handleSearchToggle}
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
        style={{ height: '100%' }}
        scrollY
        onScroll={(e) => loadMoreHandler(e)}
        // onScroll={handleScroll}
      >
        {comments[classType] &&
          comments[classType].map((comment) => (
            <>
              <Comment
                onClick={(props) => {
                  const serializedComment = encodeURIComponent(JSON.stringify(props));
                  void Taro.navigateTo({
                    url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
                  });
                }}
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
