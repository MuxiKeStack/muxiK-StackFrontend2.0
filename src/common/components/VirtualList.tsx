import { ScrollView } from '@tarojs/components';
import type { VirtualListProps as TaroVirtualListProps } from '@tarojs/components-advanced/dist/components/virtual-list';
import { memo, useCallback, useRef } from 'react';

interface VirtualListProps extends TaroVirtualListProps {
  item: React.FC<{ data: any; index: number }>;
  itemSize: number;
}

const VirtualList: React.FC<VirtualListProps> = memo(
  ({ height, width, item: Item, itemData, itemSize, onScroll }) => {
    const scrollTop = useRef<number>(0);
    const throttle = useCallback((fn, delay) => {
      let timer: NodeJS.Timeout | null = null;
      return (...args) => {
        if (timer) return;
        timer = setTimeout(() => {
          fn(...args);
          timer = null;
        }, delay);
      };
    }, []);
    const handleScroll = throttle((event) => {
      console.log('fetching');
      onScroll && onScroll(event);
    }, 1000);
    return (
      <ScrollView
        scrollY
        lowerThreshold={100}
        style={{ height: height, width: width }}
        onScrollToLower={handleScroll}
        onScroll={(event) => {
          scrollTop.current = event.detail.scrollTop;
        }}
        scrollTop={scrollTop.current}
      >
        {itemData.length > 0 &&
          itemData.map((_, index) => (
            <Item key={index} data={itemData} index={index}></Item>
          ))}
      </ScrollView>
    );
  }
);

export default VirtualList;
