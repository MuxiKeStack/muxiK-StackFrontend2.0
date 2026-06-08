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
  maxHeight?: number;
  autoFocus?: boolean;

  onSubmit: (value: string) => Promise<void> | void;
  onMentionRemoved?: () => void;
}

export interface BottomInputRef {
  focus: () => void;
  insertMention: (nickname: string) => void;
  removeMention: () => void;
  clearValue: () => void;
}

const MIN_HEIGHT_RPX = 80;

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
      const [textareaHeight, setTextareaHeight] = useState<number | null>(null);
      const mentionRef = useRef<string | null>(null);
      const focusedRef = useRef(false);

      const clampHeightPx = useCallback(
        (height: number) => {
          const minPx = Number(Taro.pxTransform(MIN_HEIGHT_RPX));
          const maxPx = Number(Taro.pxTransform(maxHeight));
          return Math.max(minPx, Math.min(height, maxPx));
        },
        [maxHeight]
      );

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
          // 已聚焦时直接插入；未聚焦时先弹键盘，待布局稳定后再插入，减轻高度跳动
          if (focusedRef.current) {
            applyMention();
          } else {
            textareaRef.current?.focus();
            setTimeout(applyMention, 120);
          }
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
          setTextareaHeight(null);
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

      const handleLineChange = useCallback(
        (e: { detail: { height: number; lineCount: number } }) => {
          const { height, lineCount } = e.detail;
          if (lineCount <= 1 && !internalValue.includes('\n')) {
            setTextareaHeight(null);
            return;
          }
          setTextareaHeight(clampHeightPx(height));
        },
        [clampHeightPx, internalValue]
      );

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
              autoHeight
              maxlength={-1}
              fixed
              showConfirmBar={false}
              onConfirm={handleSubmit}
              onLineChange={handleLineChange}
              onFocus={() => {
                focusedRef.current = true;
              }}
              onBlur={() => {
                focusedRef.current = false;
              }}
              style={{
                minHeight: `${MIN_HEIGHT_RPX}rpx`,
                maxHeight: `${maxHeight}rpx`,
                ...(textareaHeight != null ? { height: `${textareaHeight}px` } : {}),
              }}
            />
            <Button
              className={`bottomInput_sendButton ${!internalValue.trim() ? 'disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!internalValue.trim()}
            >
              <Text className="bottomInput_sendButton_btn_text">发送</Text>
            </Button>
          </View>
        </View>
      );
    }
  )
);

BottomInput.displayName = 'BottomInput';

export default BottomInput;
