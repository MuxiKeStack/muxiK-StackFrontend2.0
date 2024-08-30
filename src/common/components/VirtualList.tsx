import type { VirtualListProps as TaroVirtualListProps } from '@tarojs/components-advanced/dist/components/virtual-list';
import TaroVirtualList from '@tarojs/components-advanced/dist/components/virtual-list';
import { memo } from 'react';

interface VirtualListProps extends TaroVirtualListProps {}

const VirtualList: React.FC<VirtualListProps> = memo(
  ({ height, width, item, itemData, itemCount, itemSize, onScroll }) => (
    <TaroVirtualList
      height={height}
      width={width}
      item={item}
      itemData={itemData}
      itemCount={itemCount}
      itemSize={itemSize}
      onScroll={onScroll}
    />
  )
);

export default VirtualList;
