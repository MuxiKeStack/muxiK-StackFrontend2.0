import { View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import './index.scss';

import { loadNotifications } from '@/pages/notification/load';
import { useNotificationStore } from '@/store/notification';

import { NotificationGateScreen, TabBar, VirtualList } from '@/common/components';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import { TabItemProps } from '@/common/types/tabBarType';
import { bus } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

import { MessageItemProps } from '../type';
import { renderMessageItem } from './component/MessageItem';

const NotificationFeed: React.FC = memo(() => {
  const data = useNotificationStore((s) => s.data);
  const isLoading = useNotificationStore((s) => s.loading);

  const navigate = useCallback((url: string) => void Taro.navigateTo({ url }), []);

  const TABS: TabItemProps[] = [
    { name: '评论', icon: 'tiwen', key: 'comment' },
    { name: '点赞', icon: 'like', key: 'support' },
    { name: '官方', icon: 'guanfangbanben', key: 'official' },
  ];

  const currentMessage = useMemo(() => {
    return [...data.commentMessage, ...data.supportMessage, ...data.officialMessage];
  }, [data]);

  useEffect(() => {
    void loadNotifications();
  }, []);

  const isInitialMount = useRef(true);
  useDidShow(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    void loadNotifications();
  });

  const handleTabClick = async (key: string) => {
    try {
      let tabData: MessageItemProps[] = [];

      switch (key) {
        case 'comment':
          tabData = data.commentMessage;
          break;
        case 'support':
          tabData = data.supportMessage;
          break;
        case 'official':
          tabData = data.officialMessage;
          break;
      }
      bus.stickyEmit('notification_list', { data: tabData, type: key });
      navigate(`/pages/notification/list/index?type=${key}`);
    } catch (err) {
      console.error('跳转失败:', err);
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      await loadNotifications();
    } catch (err) {
      console.error('刷新消息失败:', err);
      Taro.showToast({ title: '刷新失败', icon: 'none' });
    }
  }, []);

  return (
    <View className="notification_main_container">
      <NavigationBar title="消息" isTabPage />

      <TabBar tabs={TABS} onTabClick={handleTabClick} />

      <View className="notification_main_list">
        <VirtualList
          height="100%"
          width="100%"
          item={renderMessageItem}
          itemData={currentMessage}
          itemCount={currentMessage.length}
          itemSize={200}
          initialLoading={isLoading}
          onRefresh={handleRefresh}
          EmptyChildren="暂无消息"
        />
      </View>
    </View>
  );
});

const Notification: React.FC = memo(() => {
  const gate = useGateGuard();

  if (gate === 'loading') return null;
  if (gate === 'block') return <NotificationGateScreen />;

  return <NotificationFeed />;
});

export default Notification;
