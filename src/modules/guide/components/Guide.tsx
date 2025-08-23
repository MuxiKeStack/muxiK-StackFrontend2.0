import { View } from '@tarojs/components';
import { memo, useState } from 'react';

import { NavigationBar } from '@/modules/navigation';

import Contact from './Contact';
import Selector from './Selector';
import Source from './Source';

const Guide: React.FC = memo(() => {
  const [selection, setSelection] = useState<{ year: string; term: string }>({
    year: '全部',
    term: '全部',
  });
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View className="mt-20 flex h-[87vh] w-full flex-col items-center gap-4">
      <NavigationBar title="选课手册" isTabPage />
      <Selector
        selection={selection}
        isOpen={isOpen}
        setSelection={setSelection}
        setIsOpen={setIsOpen}
      >
        <Source year={selection.year} term={selection.term} />
        <Contact />
      </Selector>
    </View>
  );
});

export default Guide;
