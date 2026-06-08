import { Navigator, Text, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

import IconFont from '@/common/components/iconfont';
import { useLikeAction } from '@/common/hooks/useLikeAction';
import type { CommentInfo } from '@/common/types/commentTypes';

export type ActionType = 'like' | 'comment' | 'oppose';

interface ActionItemProps {
  type: ActionType;
  count?: number;
  isActive?: boolean;
  disabled?: boolean;
  id?: number;
  stance?: number;

  onClick?: (res?: CommentInfo) => void;
}

interface LikeActionItemProps {
  count?: number;
  disabled?: boolean;
  id?: number;
  stance?: number;

  onClick?: (res?: CommentInfo) => void;
}

const LikeActionItem: React.FC<LikeActionItemProps> = ({
  count = 0,
  disabled = false,
  id,
  stance,
  onClick,
}) => {
  const { isLiked, likeCount, toggleLike } = useLikeAction({
    evaluationId: id ?? 0,
    stance,
    count,
    onSuccess: onClick,
  });

  return (
    <View
      className={`action_item like ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : (e) => void toggleLike(e)}
    >
      <View className="action_icon">
        <IconFont name="like" color={isLiked ? '#FD6C61' : ''} />
      </View>
      <Text className="action_count">{likeCount}</Text>
    </View>
  );
};

const ActionItem: React.FC<ActionItemProps> = ({
  type,
  count = 0,
  onClick,
  disabled = false,
  id,
  stance,
}) => {
  if (type === 'like') {
    return (
      <LikeActionItem
        count={count}
        disabled={disabled}
        id={id}
        stance={stance}
        onClick={onClick}
      />
    );
  }

  const renderIcon = () => {
    switch (type) {
      case 'comment':
        return <IconFont name="comment" />;
      case 'oppose':
        return <Navigator className="iconfont">&#xe785;</Navigator>;
      default:
        return null;
    }
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    if (disabled) return;
    e.stopPropagation();
    onClick?.();
  };

  return (
    <View
      className={`action_item ${type} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      <View className="action_icon">{renderIcon()}</View>
      <Text className="action_count">{count}</Text>
    </View>
  );
};

export default ActionItem;
