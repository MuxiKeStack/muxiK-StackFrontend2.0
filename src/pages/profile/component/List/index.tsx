import { userLogout } from '@/common/api/user';
import {
  BookIcon,
  ClockIcon,
  ExitIcon,
  FeedbackIcon,
  StarIcon,
} from '@/common/assets/img/profile';
import { Modal } from '@/common/components/Modal';
import { LONG_TOKEN, SHORT_TOKEN } from '@/common/constants/auth';
import { uniqueKey } from '@/common/utils';
import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { AtIcon, AtList, AtListItem } from 'taro-ui';
import './index.scss';

interface MenuItem {
  title: string;
  icon: string;
  onClick: () => void;
}

const ProfileList: React.FC = memo(() => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [test, setTest] = useState(false);

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
      const res = await userLogout();

      if (res.code === 0) {
        Taro.removeStorageSync(SHORT_TOKEN);
        Taro.removeStorageSync(LONG_TOKEN);
        Taro.reLaunch({ url: '/pages/login/index' });
      } else {
        const errorMessage = res?.message || res?.msg || res?.error || '退出异常';
        throw new Error(errorMessage);
      }
    } catch (err) {
      Taro.showToast({
        icon: 'error',
        title: '退出失败',
      });

      console.log('退出异常:', err);
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
        onClick: () => navigate('/pages/myCollection/index'),
      },
      {
        title: '评课历史',
        icon: ClockIcon as string,
        onClick: () => navigate('/pages/evaluationHistory/index'),
      },
      // {
      //   title: '成绩共享计划',
      //   icon: MailIcon as string,
      //   onClick: () => navigate('/pages/shareGrades/index'),
      // },
      {
        title: '意见反馈',
        icon: FeedbackIcon as string,
        onClick: () => navigate('/pages/feedback/main/index'),
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
      {!test ? (
        <View className="profile_list_container">
          {menuItems.map((item) => (
            <View
              key={uniqueKey.nextKey()}
              className="profile_list_item"
              onClick={item.onClick}
            >
              <View className="profile_list_item_left">
                <Image className="profile_list_item_icon" src={item.icon} />
                <Text className="profile_list_item_title">{item.title}</Text>
              </View>
              <AtIcon value="chevron-right" color="#8C8C8C" />
            </View>
          ))}
        </View>
      ) : (
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
      )}

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
