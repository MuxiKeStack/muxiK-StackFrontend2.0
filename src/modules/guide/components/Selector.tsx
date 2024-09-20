import { ConfigProvider, Picker, Popup } from '@taroify/core';
import { ArrowDown } from '@taroify/icons';
import { Text, View } from '@tarojs/components';
import { memo, useState } from 'react';

interface SelectorProps {
  children: React.ReactNode;
}

const Times = [
  [
    { label: '全部', value: '全部' },
    { label: '2022', value: '2022' },
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
  ],
  [
    { label: '全部', value: '全部' },
    { label: '第一学期', value: '第一学期' },
    { label: '第二学期', value: '第二学期' },
    { label: '第三学期', value: '第三学期' },
  ],
];

const Selector: React.FC<SelectorProps> = memo(({ children }) => {
  const [selection, setSelection] = useState<{ year: string; term: string }>({
    year: '全部',
    term: '全部',
  });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <View className="flex w-full items-center justify-between px-2">
        <View className="flex w-1/3 flex-col gap-2">
          <Text className="pl-2 text-xs">选择学年</Text>
          <View
            className="flex w-full justify-between rounded-lg bg-[#f9f9f2] px-2 py-1"
            onClick={() => setIsOpen(true)}
          >
            <Text className="text-xs">{selection.year}</Text>
            <ArrowDown className="text-xs" style={{ color: '#f18900' }} />
          </View>
        </View>
        <View className="flex w-1/3 flex-col gap-2">
          <Text className="pl-2 text-xs">选择学期</Text>
          <View
            className="flex w-full justify-between rounded-lg bg-[#f9f9f2] px-2 py-1"
            onClick={() => setIsOpen(true)}
          >
            <Text className="text-xs">{selection.term}</Text>
            <ArrowDown className="text-xs" style={{ color: '#f18900' }} />
          </View>
        </View>
      </View>
      {children}
      <ConfigProvider
        theme={{
          pickerConfirmActionColor: '#f18900',
        }}
      >
        <Popup open={isOpen} placement="bottom">
          <Popup.Close />
          <Picker
            style={{ marginBottom: '15vh' }}
            defaultValue={['全部', '全部']}
            title="选择学年和学期"
            columns={Times}
            onConfirm={(value) => {
              setSelection({ year: value[0], term: value[1] });
              setIsOpen(false);
            }}
          ></Picker>
        </Popup>
      </ConfigProvider>
    </>
  );
});

export default Selector;
