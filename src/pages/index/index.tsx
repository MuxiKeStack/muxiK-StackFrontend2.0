import { Navigator, View } from '@tarojs/components';
// import Taro from '@tarojs/taro';
import { useState } from 'react';
import { AtFloatLayout } from 'taro-ui';

import './index.scss';

export default function Index() {
  const [isFloatLayoutVisible, setIsFloatLayoutVisible] = useState(false); // 控制 AtFloatLayout 显示的状态
  // 处理打开 FloatLayout 的方法

  const handleFloatLayoutChange = (isVisible: boolean) => {
    setIsFloatLayoutVisible(isVisible);
  };

  return (
    <View className="page">
      <Navigator url="../research/research">我要跳转到搜索页面</Navigator>
      <View className="panel">
        <View className="panel__title">FloatLayout 浮动弹层</View>
        <View className="panel__content">
          <View className="example-item">
            {/* 绑定点击事件，传入 true 来显示 AtFloatLayout */}
            <View className="demo-btn" onClick={() => handleFloatLayoutChange(true)}>
              打开 Float Layout
            </View>
          </View>
          {/* AtFloatLayout 组件 */}
          <AtFloatLayout
            isOpened={isFloatLayoutVisible}
            title="浮动弹层标题"
            onClose={() => handleFloatLayoutChange(false)}
          >
            {/* 这里是浮动弹层的内容 */}
            <View>这里是内容区...</View>
          </AtFloatLayout>
        </View>
      </View>
    </View>
  );
}
