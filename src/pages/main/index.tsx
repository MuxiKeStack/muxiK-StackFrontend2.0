import { Image, ScrollView, Swiper, SwiperItem, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

import { FeedCard, FloatButton, PlazaGateScreen } from '@/common/components';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import { navigateToEvaluationDetail } from '@/common/utils/evaluation';
import { NavigationBar } from '@/modules/navigation';

import type { CommentInfo } from '@/common/types/commentTypes';
import { COURSE_TYPE, type classType } from '@/common/types/courseType';
import {
  loadMoreCourseFeed,
  refreshCourseFeed,
  useFeed,
  useFeedStore,
} from '@/pages/main/model';

const COURSE_NAME_MAP = {
  [COURSE_TYPE.ANY]: '全部',
  [COURSE_TYPE.MAJOR]: '专业',
  [COURSE_TYPE.GENERAL_ELECT]: '个性',
  [COURSE_TYPE.GENERAL_CORE]: '通核',
};

const MainFeed: React.FC = () => {
  const handleSearchToggle = () => {
    void Taro.navigateTo({
      url: '/pages/research/index',
    });
  };
  const [refresherTriggered, setRefresherTriggered] = useState(false);

  const { commentsByType: comments, classType } = useFeed();

  const scrollTopMap = useRef<Record<string, number>>({
    [COURSE_TYPE.ANY]: 0,
    [COURSE_TYPE.MAJOR]: 0,
    [COURSE_TYPE.GENERAL_ELECT]: 0,
    [COURSE_TYPE.GENERAL_CORE]: 0,
  });

  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollToTopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mountedRef = useRef(true);
  const loadGenRef = useRef(0);

  const handleScroll = useCallback((e: { detail: { scrollTop: number } }) => {
    const ct = useFeedStore.getState().classType;
    scrollTopMap.current = { ...scrollTopMap.current, [ct]: e.detail.scrollTop };
  }, []);

  const handleChangeType = useCallback((type: string) => {
    useFeedStore.getState().setType(type as classType);
    forceRender();
  }, []);

  const handleSwiperChange = useCallback(
    (e: { detail: { current: number } }) => {
      handleChangeType(Object.keys(COURSE_NAME_MAP)[e.detail.current]);
    },
    [handleChangeType]
  );

  useEffect(() => {
    const list = useFeedStore.getState().idsByType[classType];
    if (!list.length) {
      void Taro.showLoading({ title: '加载中' });
      void refreshCourseFeed()
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

  const handleComment = useCallback((props: CommentInfo) => {
    navigateToEvaluationDetail(props);
  }, []);

  const loadMoreHandler = useCallback(() => {
    const ct = useFeedStore.getState().classType;
    scrollTopMap.current = {
      ...scrollTopMap.current,
      [ct]: (scrollTopMap.current[ct] || 0) + 200,
    };

    const gen = ++loadGenRef.current;
    if (useFeedStore.getState().loading) return;

    void Taro.showLoading({ title: '加载中...', mask: false });

    void loadMoreCourseFeed()
      .then((hasMore) => {
        if (gen === loadGenRef.current) {
          Taro.hideLoading();
          if (!hasMore) void Taro.showToast({ title: '没有更多了', icon: 'none' });
        }
      })
      .catch(() => {
        if (gen === loadGenRef.current) {
          Taro.hideLoading();
          void Taro.showToast({ title: '加载失败', icon: 'error' });
        }
      });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefresherTriggered(true);

    void refreshCourseFeed()
      .catch((e) => {
        console.error('[main] 刷新评论失败:', e);
      })
      .finally(() => {
        setRefresherTriggered(false);
      });
  }, []);

  const handleScrollToTop = useCallback(() => {
    const ct = useFeedStore.getState().classType;
    scrollTopMap.current = { ...scrollTopMap.current, [ct]: 0 };
    forceRender();

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

  return (
    <View className="mt-20 flex flex-col items-center justify-center">
      <NavigationBar title="评课广场" isTabPage />
      <View className="mt-5 flex w-full items-center justify-center gap-2"></View>
      <View className="classLine">
        {Object.entries(COURSE_NAME_MAP).map(([name, displayName]) => {
          return (
            <View
              key={name}
              className={'label' + ' ' + (classType === name ? 'active' : '')}
              onClick={() => handleChangeType(name)}
            >
              {displayName}
            </View>
          );
        })}
        <View className="search" onClick={handleSearchToggle}>
          <Image
            style={{
              width: '34.09rpx',
              height: '34.09rpx',
            }}
            src="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
          />
          <Text>搜索</Text>
        </View>
      </View>
      <Swiper
        style={{ height: '70vh', width: '100vw' }}
        current={Object.keys(COURSE_NAME_MAP).indexOf(classType)}
        onChange={handleSwiperChange}
      >
        {Object.entries(scrollTopMap.current).map(([name, tabScrollTop]) => (
          <SwiperItem key={name}>
            <ScrollView
              onScroll={handleScroll}
              onScrollToLower={loadMoreHandler}
              lowerThreshold={200}
              refresherEnabled
              scrollTop={tabScrollTop}
              style={{ height: '70vh' }}
              refresherTriggered={refresherTriggered}
              scrollY
              onRefresherRefresh={handleRefresh}
            >
              {comments[name] &&
                (comments[name] as CommentInfo[]).map((comment) => (
                  <View key={comment.id}>
                    <FeedCard
                      comment={comment}
                      showTag
                      type="inner"
                      onClick={handleComment}
                      onCommentClick={handleComment}
                    />
                    <View className="h-4 w-full"></View>
                  </View>
                ))}
            </ScrollView>
          </SwiperItem>
        ))}
      </Swiper>
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

const Page: React.FC = () => {
  const gate = useGateGuard();

  if (gate === 'loading') return null;
  if (gate === 'block') return <PlazaGateScreen />;

  return <MainFeed />;
};

export default Page;
