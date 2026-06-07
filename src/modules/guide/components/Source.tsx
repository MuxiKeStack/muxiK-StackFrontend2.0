/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Text, View } from '@tarojs/components';
import { memo, useEffect, useState } from 'react';
import { AtIcon } from 'taro-ui';

import { useGuideStore } from '@/store';

import { copyToClipboard } from '@/common/utils';

interface SourceProps {
  year: string;
  term: string;
}

const handleCopy = (link: string) => {
  copyToClipboard(link, { successText: '复制链接成功', failText: '复制链接失败' });
};

const SourceItem: React.FC<{ text: string; link: string }> = memo(({ text, link }) => (
  <View
    className="flex w-full items-center gap-4 rounded-lg bg-[#FFFAEC] p-2 hover:bg-gray-200"
    onTouchEnd={() => handleCopy(link)}
  >
    <AtIcon value="file-generic" size="35" color="#f18900" />
    <Text className="text-sm">{text}</Text>
  </View>
));

const Source: React.FC<SourceProps> = memo(({ year, term }) => {
  const loadLabels = useGuideStore((s) => s.loadLabels);
  const filterLabels = useGuideStore((s) => s.filterLabels);
  const [source, setSource] = useState<{ name: string; content: string }[]>([]);

  useEffect(() => {
    void loadLabels()
      .then(() => {
        setSource(filterLabels(year, term));
      })
      .catch((error) => {
        console.error(error);
      });
  }, [term, year, loadLabels, filterLabels]);

  return (
    <View className="flex h-auto min-h-[73vh] w-[90vw] flex-col items-center rounded-lg px-4 py-2">
      {source.map((item, index) => (
        <SourceItem key={item.content || index} text={item.name} link={item.content} />
      ))}
    </View>
  );
});

export default Source;
