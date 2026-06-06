import { Button, Text, View, ViewProps } from '@tarojs/components';
import React, { useEffect, useMemo, useState } from 'react';

import './index.scss';

import { ModalBackgroundProps, ModalProps } from './type';

export const Modal: React.FC<ModalProps> = ({
  visible: initVisible = false,
  onClose,
  children,
  title,
  onCancel,
  onConfirm,
  showCancel = true,
  confirmText,
  cancelText,
  isTransparent = false,
  mode = 'middle',
}) => {
  const [visible, setVisible] = useState<boolean>(initVisible);
  useEffect(() => {
    setVisible(initVisible);
  }, [initVisible]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    handleClose();
  };

  const showButtons = useMemo(() => {
    const result = confirmText || onConfirm || (showCancel && (cancelText || onCancel));
    return result;
  }, [confirmText, onConfirm, showCancel, cancelText, onCancel]);

  const modalContent = useMemo(
    () => (
      <View className={isTransparent ? 'transparent_modal_content' : 'modal_content'}>
        {title && (
          <View className="modal_title_container">
            {typeof title === 'string' ? (
              <Text className="modal_title">{title}</Text>
            ) : (
              title
            )}
          </View>
        )}

        <View className="modal_children_container">
          {typeof children === 'string' ? (
            <Text className="modal_children">{children}</Text>
          ) : (
            children
          )}
        </View>

        {showButtons && (
          <View className="bottom_choice">
            {showCancel && (cancelText || onCancel) && (
              <Button className="cancel_view button_style" onClick={handleCancel}>
                <Text className="cancel_text">{cancelText || '取消'}</Text>
              </Button>
            )}
            {(confirmText || onConfirm) && (
              <Button className="confirm_view button_style" onClick={handleConfirm}>
                <Text className="confirm_text">{confirmText || '确认'}</Text>
              </Button>
            )}
          </View>
        )}
      </View>
    ),
    [
      children,
      title,
      showButtons,
      showCancel,
      cancelText,
      onCancel,
      confirmText,
      onConfirm,
      isTransparent,
    ]
  );

  return (
    <ModalBack visible={visible}>
      <View className={`modal_overlay ${mode === 'middle' ? 'middle' : 'bottom'}`}>
        <ModalBackground onPress={handleClose} />
        {modalContent}
      </View>
    </ModalBack>
  );
};

const ModalBackground: React.FC<ModalBackgroundProps> = ({ onPress }) => (
  <View
    className="modal_background"
    onClick={() => {
      onPress();
    }}
  />
);

export const ModalBack: React.FC<
  {
    children?: React.ReactElement;
    visible: boolean;
    onAnimationEnd?: (visible: boolean) => void;
  } & ViewProps
> = ({ children, visible, onAnimationEnd }) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);

      setTimeout(() => setOpacity(1), 10);
    } else {
      setOpacity(0);

      const timer = setTimeout(() => {
        setShouldRender(false);
        onAnimationEnd && onAnimationEnd(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [visible, onAnimationEnd]);

  useEffect(() => {
    if (visible && opacity === 1) {
      onAnimationEnd && onAnimationEnd(true);
    }
  }, [visible, opacity, onAnimationEnd]);

  if (!shouldRender) return null;

  return (
    <View
      className="modal_back"
      style={{
        opacity,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {children}
    </View>
  );
};

export default Modal;
