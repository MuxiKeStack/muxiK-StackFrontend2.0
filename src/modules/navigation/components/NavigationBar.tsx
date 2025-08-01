import { View } from '@tarojs/components';
import { navigateBack, navigateTo, switchTab } from '@tarojs/taro';
import { AtIcon } from 'taro-ui';

export interface NavigayionProps {
  isNavigateToTabPage?: boolean;
  isTabPage?: boolean;
  isBackToPage?: boolean;
  isToPage?: boolean;
  url?: string;
  style?: React.CSSProperties;
  title: string;
}

const NavigationBar: React.FC<NavigayionProps> = ({
  isNavigateToTabPage = false,
  isTabPage = false,
  isBackToPage = false,
  isToPage = false,
  url = '',
  title = '',
  style,
}) => {
  const handleNavigate = () => {
    if (isBackToPage) {
      navigateBack()
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (isNavigateToTabPage) {
      switchTab({ url: url })
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (isToPage) {
      navigateTo({ url: url })
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <View
      className="fixed left-0 top-0 w-full"
      style={{ height: '180rpx', backgroundColor: '#FFFAEC', ...style }}
    >
      <View className="w-full" style={{ marginTop: '100rpx' }}>
        {!isTabPage && (
          <AtIcon
            className="absolute bottom-3 left-3"
            value="chevron-left"
            onClick={() => handleNavigate()}
          />
        )}
        <View
          className="w-full text-center"
          style={{ height: '80rpx', lineHeight: '80rpx' }}
        >
          {title}
        </View>
      </View>
    </View>
  );
};

export default NavigationBar;
