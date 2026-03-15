import { Loading } from '@/common/components';
import { ScrollView, Text, View } from '@tarojs/components';
import type { VirtualListProps as TaroVirtualListProps } from '@tarojs/components-advanced/dist/components/virtual-list';
import { memo, useCallback, useRef, useState } from 'react';

interface VirtualListProps extends TaroVirtualListProps {
  item: React.FC<{ data: any; index: number }>;
  itemSize: number;
  bottomPadding?: number;
  hasMore?: boolean;
  FooterChildren?: string | React.ReactNode;
  onLoadMore?: () => void;
  getItemKey?: (item: any, index: number) => string | number;
}

const VirtualList: React.FC<VirtualListProps> = memo(
  ({
    height,
    width,
    item: Item,
    itemData,
    itemSize,
    hasMore,
    bottomPadding,
    getItemKey = (_, index) => index,
    onLoadMore,
    FooterChildren = '—— 没有更多了 ——',
  }) => {
    const scrollTop = useRef<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleScrollToLower = useCallback(() => {
      if (onLoadMore && !isLoading) {
        setIsLoading(true);
        onLoadMore();
      }
    }, [onLoadMore, isLoading]);

    const renderFooter = () => {
      const footerStyle = {
        height: `${bottomPadding}rpx`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      };

      if (isLoading) {
        return (
          <View style={footerStyle}>
            <Loading
              text="加载中..."
              size={32}
              type="circular"
              direction="horizontal"
              isCenter={false}
            />
          </View>
        );
      }

      if (!hasMore) {
        return (
          <View style={footerStyle}>
            {typeof FooterChildren === 'string' ? (
              <Text
                style={{
                  color: '#CCCCCC',
                  fontSize: '24rpx',
                  fontWeight: '500',
                  letterSpacing: '2rpx',
                  padding: '20rpx 0',
                }}
              >
                {FooterChildren}
              </Text>
            ) : (
              FooterChildren
            )}
          </View>
        );
      }

      return <View style={{ height: `${bottomPadding}rpx`, width: '100%' }} />;
    };

    return (
      <ScrollView
        scrollY
        lowerThreshold={50}
        style={{ height, width }}
        onScrollToLower={handleScrollToLower}
        onScroll={(event) => {
          scrollTop.current = event.detail.scrollTop;
        }}
        scrollTop={scrollTop.current}
      >
        {itemData.length > 0 &&
          itemData.map((item, index) => (
            <Item key={getItemKey(item, index)} data={itemData} index={index} />
          ))}
        {renderFooter()}
        <View style={{ height: '11.5vh' }}></View>
      </ScrollView>
    );
  }
);

export default VirtualList;
