/* eslint-disable simple-import-sort/imports */
/* eslint-disable react-hooks/exhaustive-deps */

import { Image, ScrollView, Swiper, SwiperItem, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

import { FeedCard, FloatButton, GateScreen } from '@/common/components';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import { bus } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

import type { CommentInfo } from '@/common/types/commentTypes';
import { COURSE_TYPE } from '@/common/types/courseType';
import { useCourseStore } from '@/store/useCourseStore';

const COURSE_NAME_MAP = {
  [COURSE_TYPE.ANY]: '全部',
  [COURSE_TYPE.MAJOR]: '专业',
  [COURSE_TYPE.GENERAL_ELECT]: '个性',
  [COURSE_TYPE.GENERAL_CORE]: '通核',
};

const Page: React.FC = () => {
  const handleSearchToggle = () => {
    void Taro.navigateTo({
      url: '/pages/research/index',
    });
  };
  const [refresherTriggered, setRefresherTriggered] = useState(false);

  // const [comments, setComments] = useState<CommentInfoType[]>([]);
  // const [module, setModule] = useState(PAGE_MODULES_MAP['COURSE_REVIEW']);
  const comments = useCourseStore((state) => state.comments);

  const classType = useCourseStore((state) => state.classType);
  const dispatch = useCourseStore(
    ({ loadMoreComments, refreshComments, changeType }) => ({
      loadMoreComments,
      refreshComments,
      changeType,
    })
  );

  const scrollTopMap = useRef<Record<string, number>>({
    [COURSE_TYPE.ANY]: 0,
    [COURSE_TYPE.MAJOR]: 0,
    [COURSE_TYPE.GENERAL_ELECT]: 0,
    [COURSE_TYPE.GENERAL_CORE]: 0,
  });
  const [scrollTop, setScrollTop] = useState(0);
  const gate = useGateGuard();

  // 定时器
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollToTopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 生命周期
  const mountedRef = useRef(true);
  const loadGenRef = useRef(0);

  const handleScroll = useCallback((e: { detail: { scrollTop: number } }) => {
    const ct = useCourseStore.getState().classType;
    scrollTopMap.current = { ...scrollTopMap.current, [ct]: e.detail.scrollTop };
  }, []);

  const handleSwiperChange = useCallback((e: { detail: { current: number } }) => {
    handleChangeType(Object.keys(COURSE_NAME_MAP)[e.detail.current]);
  }, []);

  const handleChangeType = useCallback((type: string) => {
    useCourseStore.getState().changeType(type as any);
    setScrollTop(scrollTopMap.current[type] as number);
  }, []);

  useEffect(() => {
    if (!comments[classType].length) {
      void Taro.showLoading({ title: '加载中' });
      void dispatch
        .refreshComments()
        .then(() => {
          loadingTimerRef.current = setTimeout(() => {
            Taro.hideLoading();
          }, 1000);
        })
        .catch(() => {
          Taro.hideLoading();
          void Taro.showToast({ title: '加载失败', icon: 'none' });
        });
    }
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [classType]);

  const handleComment = useCallback((props: any) => {
    bus.stickyEmit('evaluation', props);
    void Taro.navigateTo({ url: '/pages/evaluateInfo/index' });
  }, []);

  const loadMoreHandler = useCallback(() => {
    const ct = useCourseStore.getState().classType;
    scrollTopMap.current = {
      ...scrollTopMap.current,
      [ct]: (scrollTopMap.current[ct] || 0) + 200,
    };

    const gen = ++loadGenRef.current;
    if (useCourseStore.getState().loading) return;

    void Taro.showLoading({ title: '加载中...', mask: false });

    void dispatch
      .loadMoreComments()
      .then(() => {
        if (gen === loadGenRef.current) Taro.hideLoading();
      })
      .catch(() => {
        if (gen === loadGenRef.current) {
          Taro.hideLoading();
          void Taro.showToast({ title: '加载失败', icon: 'error' });
        }
      });
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    setRefresherTriggered(true);

    void dispatch.refreshComments().catch((e) => {
      console.error('[main] 刷新评论失败:', e);
    }).finally(() => {
      setRefresherTriggered(false);
    });
  }, [dispatch]);

  const handleScrollToTop = useCallback(() => {
    const ct = useCourseStore.getState().classType;
    setScrollTop(0);
    scrollTopMap.current = { ...scrollTopMap.current, [ct]: 0 };

    if (scrollToTopTimerRef.current) clearTimeout(scrollToTopTimerRef.current);
    scrollToTopTimerRef.current = setTimeout(() => {
      handleRefresh();
    }, 600);
  }, [handleRefresh]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      loadGenRef.current = 0;

      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      if (scrollToTopTimerRef.current) clearTimeout(scrollToTopTimerRef.current);
    };
  }, []);

  if (gate === 'loading') return null;
  if (gate === 'block') return <GateScreen />;
  return (
    <View className="mt-20 flex flex-col items-center justify-center">
      <NavigationBar title="评课广场" isTabPage />
      <View className="mt-5 flex w-full items-center justify-center gap-2"></View>
      <View className="classLine">
        {Object.entries(COURSE_NAME_MAP).map(([name, displayName]) => {
          return (
            <>
              <View
                className={'label' + ' ' + (classType === name ? 'active' : '')}
                // onClick={() => handleChangeType(name)}
                onClick={() => handleChangeType(name)}
              >
                {displayName}
              </View>
            </>
          );
        })}
        <View className="search" onClick={handleSearchToggle}>
          <Image
            style={{
              width: '34.09rpx',
              height: '34.09rpx',
            }}
            src={'https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png'}
          />
          <Text>搜索</Text>
        </View>
      </View>
      <Swiper
        style={{ height: '70vh', width: '100vw' }}
        current={Object.keys(COURSE_NAME_MAP).indexOf(classType)}
        onChange={handleSwiperChange}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
        {Object.entries(scrollTopMap.current).map(([name, scrollTop]) => (
          <SwiperItem key={name}>
            <ScrollView
              onScroll={handleScroll}
              onScrollToLower={loadMoreHandler}
              lowerThreshold={200}
              refresherEnabled
              scrollTop={scrollTop}
              style={{ height: '70vh' }}
              refresherTriggered={refresherTriggered}
              scrollY
              onRefresherRefresh={handleRefresh}
            >
              {comments[name] &&
                (comments[name] as CommentInfo[]).map((comment) => (
                  <>
                    <FeedCard
                      key={comment.id}
                      comment={comment}
                      showTag
                      type="inner"
                      onClick={() => handleComment({ ...comment, type: 'inner' })}
                      onCommentClick={() => handleComment({ ...comment, type: 'inner' })}
                    />
                    <View className="h-4 w-full"></View>
                  </>
                ))}
            </ScrollView>
          </SwiperItem>
        ))}
      </Swiper>
      {/* 刷新按钮 */}
      <FloatButton
        icon={<AtIcon value="chevron-up" size="30" color="#FFD777" />}
        shape="circle"
        side="right"
        verticalOffset="80%"
        horizontalOffset={16}
        onClick={handleScrollToTop}
      />
    </View>
  );
};

export default Page;
