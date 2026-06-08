import { ScrollView, Text, View } from '@tarojs/components';
import type { VirtualListProps as TaroVirtualListProps } from '@tarojs/components-advanced/dist/components/virtual-list';
import { memo, ReactNode, useCallback, useRef, useState } from 'react';
import Loading from '../Loading';

interface VirtualListProps extends TaroVirtualListProps {
  item: React.FC<{ id: any; data: any; index: number }>;
  itemSize: number;
  bottomPadding?: number;
  hasMore?: boolean;
  FooterChildren?: string | ReactNode;
  EmptyChildren?: string | ReactNode;
  initialLoading?: boolean;
  timeout?: number;

  onTimeout?: () => void;
  onLoadMore?: () => void;
  getItemKey?: (item: any, index: number) => string | number;
}

const VirtualList: React.FC<VirtualListProps> = memo(
  ({
    height,
    width,
    item: Item,
    itemData,
    hasMore = false,
    bottomPadding = 0,
    getItemKey = (_, index) => index,
    onLoadMore,
    FooterChildren = '—— 没有更多了 ——',
    EmptyChildren = '暂无数据',
    initialLoading = false,
    timeout = 10000,
    onTimeout,
  }) => {
    const isFirstLoad = useRef(true);
    const scrollTop = useRef(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleScrollToLower = useCallback(async () => {
      if (!onLoadMore || isLoading) return;

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      } else if (!hasMore) return;

      const IstimeOut = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('加载超时')), timeout)
      );

      try {
        setIsLoading(true);
        await Promise.race([onLoadMore(), IstimeOut]);
      } catch (error) {
        console.error('加载更多失败', error);
        onTimeout?.();
      } finally {
        setIsLoading(false);
      }
    }, [onLoadMore, isLoading, hasMore, timeout, onTimeout]);

    const renderFooter = () => {
      const footerStyle = {
        height: `${bottomPadding}rpx`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: '36rpx',
      };

      if (isLoading) {
        return (
          <View style={footerStyle}>
            <Loading size={32} type="circular" isCenter={false} />
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

    if (initialLoading && itemData.length === 0) {
      return (
        <View
          style={{
            height,
            width,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Loading type="circular" size={60} isCenter />
        </View>
      );
    }

    if (!initialLoading && itemData.length === 0) {
      return (
        <View
          style={{
            height,
            width,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#999',
              fontSize: '28rpx',
            }}
          >
            {EmptyChildren}
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        scrollY
        lowerThreshold={200}
        style={{ height, width }}
        onScrollToLower={handleScrollToLower}
        onScroll={(event) => {
          scrollTop.current = event.detail.scrollTop;
        }}
      >
        {itemData.map((item, index) => (
          <Item
            id={item.id}
            key={getItemKey(item, index)}
            data={itemData}
            index={index}
          />
        ))}
        {renderFooter()}
        <View style={{ height: '11.5vh' }} />
      </ScrollView>
    );
  }
);

export default VirtualList;
