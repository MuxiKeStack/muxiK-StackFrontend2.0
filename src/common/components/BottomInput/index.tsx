import useKeyboardStatus from '@/common/hooks/useKeyboardStatus';
import { Button, Textarea, View } from '@tarojs/components';
import { useEffect, useRef } from 'react';
import './index.scss';

interface BottomInputProps {
  /** 占位符文本 */
  placeholder?: string;
  /** 输入框内容 */
  value: string;
  /** 内容变化回调 */
  onChange: (value: string) => void;
  /** 提交回调 */
  onSubmit: () => Promise<void> | void;
  /** 回复对象信息 */
  replyTo?: { nickname: string } | null;
  /** 最大高度 (rpx) */
  maxHeight?: number;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
}

const BottomInput: React.FC<BottomInputProps> = ({
  placeholder = '写下你的评论...',
  value,
  onChange,
  onSubmit,
  replyTo = null,
  maxHeight = 300,
  autoFocus = false,
}) => {
  const { isKeyboardShow, keyboardHeight } = useKeyboardStatus();
  const textareaRef = useRef<any>(null);

  const displayPlaceholder = replyTo ? `回复给${replyTo.nickname}: ` : placeholder;

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleInput = (e: any) => {
    onChange(e.detail.value);
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit();
  };

  return (
    <View className="bottomInput">
      <View className="bottomInput_container">
        <Textarea
          className="bottomInput_textarea"
          ref={textareaRef}
          value={value}
          onInput={handleInput}
          placeholder={displayPlaceholder}
          placeholderClass="bottomInput_placeholder"
          autoHeight // 使用 Taro 的自动高度，不要手动控制
          maxlength={-1} // 不限制输入长度
          fixed
          showConfirmBar={false}
          onConfirm={handleSubmit}
          style={{ maxHeight: `${maxHeight}rpx` }}
        />
        <Button
          className={`bottomInput_sendButton ${!value.trim() ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          发送
        </Button>
      </View>
    </View>
  );
};

export default BottomInput;
