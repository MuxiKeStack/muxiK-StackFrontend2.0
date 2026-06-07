import { Button, Text, Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import './index.scss';

interface BottomInputProps {
  placeholder?: string;
  onSubmit: (value: string) => Promise<void> | void;
  onMentionRemoved?: () => void;
  maxHeight?: number;
  autoFocus?: boolean;
}

export interface BottomInputRef {
  focus: () => void;
  insertMention: (nickname: string) => void;
  removeMention: () => void;
  clearValue: () => void;
}

const BottomInput = memo(
  forwardRef<BottomInputRef, BottomInputProps>(
    (
      {
        placeholder = '写下你的评论...',
        onSubmit,
        onMentionRemoved,
        maxHeight = 300,
        autoFocus = false,
      },
      ref
    ) => {
      const textareaRef = useRef<any>(null);
      const [internalValue, setInternalValue] = useState('');
      const mentionRef = useRef<string | null>(null);

      const doFocus = () => {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      };

      useImperativeHandle(ref, () => ({
        focus: doFocus,

        insertMention: (nickname: string) => {
          const prefix = `@${nickname} `;
          mentionRef.current = prefix;
          const applyMention = () => {
            setInternalValue((prev) => {
              const withoutMention = prev.replace(/^@\S+\s?/, '');
              return prefix + withoutMention;
            });
          };
          // 先聚焦再插入 @，避免键盘弹起前后宽度变化引发高度重算
          textareaRef.current?.focus();
          Taro.nextTick(applyMention);
        },
        removeMention: () => {
          mentionRef.current = null;
          setInternalValue((prev) => {
            const match = prev.match(/^@\S+\s?/);
            return match ? prev.slice(match[0].length) : prev;
          });
        },

        clearValue: () => {
          mentionRef.current = null;
          setInternalValue('');
        },
      }));

      useEffect(() => {
        if (autoFocus) {
          doFocus();
        }
      }, [autoFocus]);

      const handleInput = useCallback(
        (e: any) => {
          const val = e.detail.value;
          const mention = mentionRef.current;

          if (mention && !val.startsWith(mention)) {
            mentionRef.current = null;
            onMentionRemoved?.();
            setInternalValue(val.replace(/^@\S+\s?/, ''));
            return;
          }

          setInternalValue(val);
        },
        [onMentionRemoved]
      );

      const handleSubmit = useCallback(() => {
        const mention = mentionRef.current;
        const text = mention
          ? internalValue.slice(mention.length).trim()
          : internalValue.trim();
        if (!text) return;
        onSubmit(text);
      }, [internalValue, onSubmit]);

      return (
        <View className="bottomInput">
          <View className="bottomInput_container">
            <Textarea
              className="bottomInput_textarea"
              ref={textareaRef}
              value={internalValue}
              onInput={handleInput}
              placeholder={placeholder}
              placeholderClass="bottomInput_placeholder"
              maxlength={-1}
              fixed
              showConfirmBar={false}
              onConfirm={handleSubmit}
              style={{ maxHeight: `${maxHeight}rpx` }}
            />
            <Button
              className={`bottomInput_sendButton ${!internalValue.trim() ? 'disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!internalValue.trim()}
            >
              <Text className="bottomInput_btn_text">发送</Text>
            </Button>
          </View>
        </View>
      );
    }
  )
);

BottomInput.displayName = 'BottomInput';

export default BottomInput;
