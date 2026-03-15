import { fileIcon } from '@/common/assets/img/icons';
import { NavigationBar } from '@/modules/navigation';
import { Picker, Popup } from '@taroify/core';
import { ArrowDown } from '@taroify/icons';
import { Image, ScrollView, Text, View } from '@tarojs/components';
import { CSSProperties, memo, useEffect, useState } from 'react';
import Contact from './Contact';
import { MOCK_GUIDES, getFilteredGuides } from './mock';
import './style.scss';

const Guide: React.FC = memo(() => {
  return (
    <View className="guide_container">
      <NavigationBar title="选课手册" isTabPage />
      <Contact />
      <CourseCatalog />
    </View>
  );
});

// todos: 这块到时候重新理一下，我的Picker依赖怎么有问题
const CourseCatalog: React.FC = memo(() => {
  const [guides, setGuides] = useState<any>([]);
  const [filteredGuides, setFilteredGuides] = useState<any>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [year, setYear] = useState<string>('全部');
  const [term, setTerm] = useState<string>('全部');

  useEffect(() => {
    setGuides(MOCK_GUIDES);
    setFilteredGuides(MOCK_GUIDES);
  }, [isOpen]);

  const handlePick = (yearOption: string, TermOption: string) => {
    const filtered = getFilteredGuides(guides, yearOption, TermOption);
    setFilteredGuides(filtered);
  };

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

  return (
    <View className="course_catalog">
      <Select value={'全部'} setIsOpen={setIsOpen} />

      <ScrollView
        className="scroll_view_container"
        scrollY
        scrollWithAnimation
        enhanced
        showScrollbar
        refresherEnabled={false}
      >
        {filteredGuides.map((guide) => {
          return (
            <View className="guide_item" key={guide.id || guide.title}>
              <Image src={fileIcon} className="guide_icon" />
              <Text className="guide_item_text">{guide.title}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* todos:我的依赖有问题吗？记得换taro自带的Picker */}
      <Popup open={isOpen} placement="bottom">
        <Popup.Backdrop />
        <Picker
          defaultValue={['全部', '全部']}
          title="选择学年和学期"
          cancelText="取消"
          confirmText="确定"
          columns={Times()}
          onConfirm={(value) => {
            setYear(value[0]);
            setTerm(value[1]);
            handlePick(value[0], value[1]);
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
        />
      </Popup>
    </View>
  );
});

interface SelectProps {
  value: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  style?: CSSProperties;
}

const Select: React.FC<SelectProps> = memo(({ value, setIsOpen, style }) => (
  <View className="select_container" style={style}>
    <Text className="select_label">选择手册:</Text>
    <View className="select_value_container" onClick={() => setIsOpen(true)}>
      <Text className="select_value">{value}</Text>
      <ArrowDown className="select_arrow" style={{ color: '#f18900' }} />
    </View>
  </View>
));

export default Guide;
