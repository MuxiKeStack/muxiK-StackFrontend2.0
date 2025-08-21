import { ConfigProvider, Picker, Popup } from '@taroify/core';
import { ArrowDown } from '@taroify/icons';
import { Text, View } from '@tarojs/components';
import { CSSProperties, memo } from 'react';

import { uniqueKey } from '@/common/utils';

type SelectType = '学年' | '学期';

interface SelectProps {
  type: SelectType;
  value: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  style?: CSSProperties;
}

interface SelectorProps {
  selection: { year: string; term: string };
  isOpen: boolean;
  setSelection: React.Dispatch<React.SetStateAction<{ year: string; term: string }>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

const Times = () => {
  const startYear = 2022;
  const date = new Date();
  const currentYear =
    date.getMonth() + 1 > 8 ? date.getFullYear() : date.getFullYear() - 1;

  return [
    [
      { label: '全部', value: '全部' },
      ...Array(currentYear - startYear + 1)
        .fill(null)
        .map((_, index) => ({
          label: `${startYear + index}`,
          value: `${startYear + index}`,
        })),
    ],
    [
      { label: '全部', value: '全部' },
      { label: '第一学期', value: '第一学期' },
      { label: '第二学期', value: '第二学期' },
      { label: '第三学期', value: '第三学期' },
    ],
  ];
};

const Select: React.FC<SelectProps> = memo(({ type, value, setIsOpen, style }) => (
  <View className="flex w-1/2 flex-col justify-center gap-2" style={style}>
    <Text className="w-full pl-2 text-center text-base">选择{type}</Text>
    <View
      className="flex w-full justify-between rounded-lg bg-[#f9f9f2] px-2 py-1"
      onTouchEnd={() => setIsOpen(true)}
    >
      <Text className="text-xs">{value}</Text>
      <ArrowDown className="text-xs" style={{ color: '#f18900' }} />
    </View>
  </View>
));

const Selector: React.FC<SelectorProps> = memo(
  ({ selection, isOpen, setSelection, setIsOpen, children }) => (
    <>
      <View className="mt-4 flex w-full items-center justify-center pt-2">
        {['学年', '学期'].map((item: SelectType) => (
          <Select
            style={{ width: '50%' }}
            key={uniqueKey.nextKey()}
            type={item}
            value={item === '学年' ? selection.year : selection.term}
            setIsOpen={setIsOpen}
          />
        ))}
      </View>
      {children}
      <Popup open={isOpen} placement="bottom">
        <ConfigProvider theme={{ pickerConfirmActionColor: '#f18900' }}>
          <Picker
            style={{ marginBottom: '15vh' }}
            defaultValue={['全部', '全部']}
            title="选择学年和学期"
            cancelText="取消"
            confirmText="确定"
            columns={Times()}
            onConfirm={(value) => {
              setSelection({ year: value[0], term: value[1] });
              setIsOpen(false);
            }}
            onCancel={() => setIsOpen(false)}
          />
        </ConfigProvider>
      </Popup>
    </>
  )
);

export default Selector;
