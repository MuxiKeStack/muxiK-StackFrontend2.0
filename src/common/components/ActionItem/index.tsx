import { Navigator, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import './index.scss';

import { useCourseStore } from '@/store/useCourseStore';

import IconFont from '@/common/components/iconfont';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { COMMENT_ACTIONS } from '@/common/types/courseType';

export type ActionType = 'like' | 'comment' | 'oppose';

interface ActionItemProps {
  type: ActionType;
  count?: number;
  isActive?: boolean;
  disabled?: boolean;
  id?: number;
  stance?: number;
  onClick?: (res?: any) => void;
}

const ActionItem: React.FC<ActionItemProps> = ({
  type,
  count = 0,
  onClick,
  disabled = false,
  id,
  stance,
}) => {
  const [shouldSupport, setShouldSupport] = useState(stance === 1);
  const [totalCount, setTotalCount] = useState(count);
  const endorse = useCourseStore((state) => state.endorse);
  const { guard } = useAuthGuard();

  useEffect(() => {
    setShouldSupport(stance === 1);
  }, [stance]);

  useEffect(() => {
    setTotalCount(count);
  }, [count]);

  const renderIcon = () => {
    switch (type) {
      case 'like':
        return <IconFont name="like" color={shouldSupport ? '#FD6C61' : ''} />;
      case 'comment':
        return <IconFont name="comment" />;
      case 'oppose':
        return <Navigator className="iconfont">&#xe785;</Navigator>;
      default:
        return null;
    }
  };

  const handleClick = async (e) => {
    if (disabled) return;

    e.stopPropagation();

    if (!guard()) return;

    if (type === 'like') {
      const oriSupport = shouldSupport;
      const oriTotalCount = totalCount;
      const willSupport = !oriSupport;

      void Taro.showLoading({ title: '点赞中' });
      try {
        const res = await endorse(
          id ?? 0,
          oriSupport ? COMMENT_ACTIONS.DISLIKE : COMMENT_ACTIONS.LIKE
        );
        Taro.hideLoading();
        setShouldSupport(willSupport);
        setTotalCount(oriTotalCount + (willSupport ? 1 : -1));
        void Taro.showToast({
          title: willSupport ? '点赞成功' : '取消成功',
          icon: 'success',
          duration: 1000,
        });
        onClick?.(res);
      } catch {
        Taro.hideLoading();
        void Taro.showToast({ title: '服务端错误', icon: 'error' });
      }
    } else {
      onClick?.();
    }
  };

  return (
    <View
      className={`action_item ${type} ${disabled ? 'disabled' : ''}`}
      onClick={(e) => handleClick(e)}
    >
      <View className="action_icon">{renderIcon()}</View>
      <Text className="action_count">{totalCount}</Text>
    </View>
  );
};

export default ActionItem;
