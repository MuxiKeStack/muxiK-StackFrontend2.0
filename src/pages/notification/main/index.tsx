import { VirtualList } from '@/common/components';
import { TabItemProps } from '@/common/types/tabBarType';
import { bus } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';
import { useNotificationStore } from '@/store';
import { View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import TabBar from '../../../common/components/TabBar';
import { MessageItemProps } from '../type';
import { renderMessageItem } from './component/MessageItem';
import './index.scss';

const Notification: React.FC = memo(() => {
  const data = useNotificationStore((s) => s.data);
  const isLoading = useNotificationStore((s) => s.loading);
  const load = useNotificationStore((s) => s.load);

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
    void load();
  }, [load]);

  const isInitialMount = useRef(true);
  useDidShow(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    void load();
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

  return (
    <View className="notification_main_container">
      <NavigationBar title="消息" isTabPage />

      <TabBar tabs={TABS} onTabClick={handleTabClick} />

      <View style={{ flex: 1, width: '100%' }}>
        <VirtualList
          height="100%"
          width="100%"
          item={renderMessageItem}
          itemData={currentMessage}
          itemCount={currentMessage.length}
          itemSize={200}
          initialLoading={isLoading}
          EmptyChildren="暂无消息"
        />
      </View>
    </View>
  );
});

export default Notification;
