import { Button, Image, Text, View } from '@tarojs/components';
import { useState } from 'react';
import { AtIcon } from 'taro-ui';

import './normalquestions.scss';

import ResolvedIcon from '@/common/assets/img/profile/feedback/resolved.svg';
import ResolvedSelectedIcon from '@/common/assets/img/profile/feedback/resolved_selected.svg';
import ResolvedShowIcon from '@/common/assets/img/profile/feedback/resolved_show.svg';
import UnresolvedIcon from '@/common/assets/img/profile/feedback/unresolved.svg';
import UnresolvedSelectedIcon from '@/common/assets/img/profile/feedback/unresolved_selected.svg';
import { Modal } from '@/common/components/Modal';

type Status = 'notSelected' | 'resolved' | 'unresolved';

interface FAQItemProps {
  title: string;
  content: React.ReactNode;
  solution: React.ReactNode;
  isExpanded: boolean;
  initialStatus: Status;
  onToggle: () => void;
  onPress: (status: Status) => Promise<boolean>;
}

const FAQItem: React.FC<FAQItemProps> = ({
  title,
  content,
  solution,
  isExpanded,
  initialStatus,
  onToggle,
  onPress,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Status>(
    initialStatus || 'notSelected'
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitleText, setModalTitleText] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalConfirmHandler, setModalConfirmHandler] = useState<() => void>(
    () => () => {}
  );

  // 显示确认弹窗
  const showStatusConfirmModal = (
    titleText: string,
    description: string,
    onConfirm: () => void
  ) => {
    setModalTitleText(titleText);
    setModalDescription(description);
    setModalConfirmHandler(() => onConfirm);
    setModalVisible(true);
  };

  const handleStatusSelect = async (status: Status) => {
    if (selectedStatus === status) return;
    const success = await onPress(status);
    if (success) setSelectedStatus(status);
  };

  return (
    <View className={`faq-wrapper ${isExpanded ? 'expanded' : ''}`}>
      {/* 标题 */}
      <View className="faq-title" onTouchStart={onToggle}>
        <View className="icon-wrapper">
          <AtIcon
            value={isExpanded ? 'chevron-down' : 'chevron-right'}
            size={14}
            color="#ffffff"
          />
        </View>
        <View className="faq-text">
          <Text>{title || '暂无问题'}</Text>
        </View>
      </View>

      {isExpanded && (
        <>
          <View className="faq-content">
            <View>
              <Text className="faq-text">{content}</Text>
            </View>

            <Text className="faq-title">解决方案</Text>
            <View className={`faq-wrapper ${isExpanded ? 'expanded' : ''}`}>
              <Text className="faq-text">{solution}</Text>
            </View>
          </View>

          <View className="faq-footer">
            <View className="faq-lines">
              <View className="line" />
              <Text className="faq-text">您的的问题是否已解决?</Text>
              <View className="line" />
            </View>

            <View className="faq-status-container">
              <View className="status-buttons">
                <Button
                  className={`status-button unresolved ${
                    selectedStatus === 'unresolved' ? 'selected' : ''
                  }`}
                  onClick={() =>
                    showStatusConfirmModal(
                      '问题未解决',
                      '您确认问题仍未解决吗？我们会记录您的反馈并持续改进',
                      () => void handleStatusSelect('unresolved')
                    )
                  }
                  disabled={selectedStatus === 'unresolved'}
                >
                  <Image
                    src={
                      selectedStatus === 'unresolved'
                        ? UnresolvedSelectedIcon
                        : UnresolvedIcon
                    }
                    mode="widthFix"
                    style={{
                      width: '28rpx',
                      height: '26rpx',
                      marginRight: '8rpx',
                    }}
                    className="button-icon"
                  />
                  <Text className="btn-text">未解决</Text>
                </Button>

                <Button
                  className={`status-button resolved ${
                    selectedStatus === 'resolved' ? 'selected' : ''
                  }`}
                  onClick={() =>
                    showStatusConfirmModal(
                      '问题已解决',
                      '您确认问题已经解决了吗？这将帮助我们更好地优化内容',
                      () => void handleStatusSelect('resolved')
                    )
                  }
                  disabled={selectedStatus === 'resolved'}
                >
                  <Image
                    src={
                      selectedStatus === 'resolved' ? ResolvedSelectedIcon : ResolvedIcon
                    }
                    mode="widthFix"
                    style={{
                      width: '28rpx',
                      height: '26rpx',
                      marginRight: '8rpx',
                    }}
                    className="button-icon"
                  />
                  <Text className="btn-text">已解决</Text>
                </Button>
              </View>
            </View>
          </View>
        </>
      )}
      <Modal
        visible={modalVisible}
        title={
          <>
            <Image
              src={ResolvedShowIcon}
              mode="widthFix"
              style={{
                width: '36rpx',
                height: '32rpx',
                marginRight: '8rpx',
                marginTop: '20rpx',
              }}
            />

            <Text className="modal-title">{modalTitleText}</Text>
          </>
        }
        showCancel
        confirmText="确认"
        cancelText="取消"
        onCancel={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
        onConfirm={() => {
          modalConfirmHandler();
          setModalVisible(false);
        }}
        mode="middle"
      >
        <Text className="modal-content">{modalDescription}</Text>
      </Modal>
    </View>
  );
};

export default FAQItem;
