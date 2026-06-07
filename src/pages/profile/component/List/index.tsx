import Taro from '@tarojs/taro';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { AtList, AtListItem } from 'taro-ui';

import './index.scss';

import { useActiveButtonStore, useAuthStore } from '@/store';
import { useUserStore } from '@/store/useUserStore';

import {
  BookIcon,
  ClockIcon,
  ExitIcon,
  FeedbackIcon,
  StarIcon,
} from '@/common/assets/img/profile';
import { Modal } from '@/common/components/Modal';
import { LONG_TOKEN, SHORT_TOKEN, VISITOR } from '@/common/constants/auth';
import { ROUTES } from '@/common/constants/routes';
import { uniqueKey } from '@/common/utils';

interface MenuItem {
  title: string;
  icon: string;
  onClick: () => void;
}

const ProfileList: React.FC = memo(() => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // const [test, setTest] = useState(false);

  const navigate = useCallback((url: string) => {
    Taro.navigateTo({ url });
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    Taro.showToast({
      icon: 'loading',
      title: '退出中',
    });

    try {
      await useAuthStore.logout();
      Taro.removeStorageSync(SHORT_TOKEN);
      Taro.removeStorageSync(LONG_TOKEN);
      Taro.removeStorageSync(VISITOR);
      Taro.removeStorageSync('user_myClass_storage');
      Taro.removeStorageSync('user_collections_storage');
      useActiveButtonStore.getState().setActiveButton('Home');
      useUserStore.getState().invalidateAll();
      Taro.reLaunch({ url: '/pages/login/index' });
    } catch {
      Taro.showToast({
        icon: 'error',
        title: '退出失败',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        title: '我的课程',
        icon: BookIcon as string,
        onClick: () => navigate('/pages/myclass/index'),
      },
      {
        title: '我的收藏',
        icon: StarIcon as string,
        onClick: () => navigate(ROUTES.profile.myCollection),
      },
      {
        title: '评课历史',
        icon: ClockIcon as string,
        onClick: () => navigate(ROUTES.profile.evaluationHistory),
      },
      {
        title: '意见反馈',
        icon: FeedbackIcon as string,
        onClick: () => navigate(ROUTES.feedback.main),
      },
      {
        title: '退出登录',
        icon: ExitIcon as string,
        onClick: () => setShowLogoutModal(true),
      },
    ],
    [navigate]
  );

  return (
    <>
      <AtList className="profile_list_atlist">
        {menuItems.map((item) => (
          <AtListItem
            key={uniqueKey.nextKey()}
            title={item.title}
            arrow="right"
            thumb={item.icon}
            onClick={item.onClick}
          />
        ))}
      </AtList>

      <Modal
        visible={showLogoutModal}
        title="退出登录"
        onClose={() => setShowLogoutModal(false)}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        confirmText="确认"
        cancelText="取消"
      >
        确定要退出登录吗？
      </Modal>
    </>
  );
});

export default ProfileList;
