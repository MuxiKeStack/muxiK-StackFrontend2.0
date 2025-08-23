/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useEffect, useState } from 'react';
import { AtIcon } from 'taro-ui';

import { get } from '@/common/api/get';

interface SourceProps {
  year: string;
  term: string;
  // label: {
  //   year: string;
  //   term: string;
  //   type: string;
  // };
}

const handleCopy = (link: string) => {
  void Taro.setClipboardData({
    data: link,
    success: () => {
      void Taro.showToast({
        title: '复制链接成功',
        icon: 'success',
        duration: 2000,
      });
    },
    fail: () => {
      void Taro.showToast({
        title: '复制链接失败',
        icon: 'none',
        duration: 2000,
      });
    },
  });
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
  const [source, setSource] = useState<{ name: string; content: string }[]>([]);

  useEffect(() => {
    const getSouce = async () => {
      try {
        const type = '选课手册';
        const res = await get(`/statics/match/labels?labels[type]=${type}`);
        let filteredData = res.data;
        if (year !== '全部' || term !== '全部') {
          if (year !== '全部' && term !== '全部') {
            filteredData = filteredData.filter(
              (item) => item.labels.year === year && item.labels.term === term
            );
          } else if (year === '全部') {
            filteredData = filteredData.filter((item) => item.labels.term === term);
          } else if (term === '全部') {
            filteredData = filteredData.filter((item) => item.labels.year === year);
          }
          const mappedData = filteredData.map((item) => ({
            name: item.name as string,
            content: item.content as string,
          }));
          setSource(mappedData);
        } else {
          setSource(filteredData);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };
    void getSouce();
  }, [term, year]);

  return (
    <View className="flex h-auto min-h-[73vh] w-[90vw] flex-col items-center rounded-lg px-4 py-2">
      {/* <SourceItem text="2022-2023第一学期选课手册" link="" />
      <SourceItem text="2022-2023第一学期选课手册(2)" link="" />
      <SourceItem text="2022-2023第一学期选课手册(3)" link="" /> */}
      {source.map((item, index) => (
        <SourceItem key={index} text={item.name} link={item.content} />
      ))}
    </View>
  );
});

export default Source;
