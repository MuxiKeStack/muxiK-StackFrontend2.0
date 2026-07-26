import { ScrollView, Text, View } from '@tarojs/components';

import { NavigationBar } from '@/modules/navigation';

import './index.scss';

const OFFICIAL_MESSAGES = [
  {
    title: '欢迎使用木犀课栈',
    content: '感谢使用木犀课栈小程序。本平台致力于为大家提供课程查询与选课辅助服务。',
    time: '2026-03-01',
  },
  {
    title: '消息中心说明',
    content:
      '消息中心用于接收平台官方通知与重要公告。请留意本页更新，课程与教务信息以学校官方发布为准。',
    time: '2026-02-15',
  },
  {
    title: '功能更新预告',
    content: '团队正在优化产品体验，相关能力开放后将通过本页第一时间通知，敬请留意。',
    time: '2026-01-20',
  },
] as const;

const NotificationGateScreen: React.FC = () => {
  return (
    <View className="notification_gate">
      <NavigationBar title="消息" isBackToPage />

      <View className="notification_gate_header">
        <Text className="notification_gate_header_title">官方公告</Text>
        <Text className="notification_gate_header_desc">仅展示平台运营通知</Text>
      </View>

      <ScrollView scrollY className="notification_gate_scroll">
        {OFFICIAL_MESSAGES.map((item) => (
          <View key={item.title} className="notification_gate_card">
            <View className="notification_gate_card_badge">
              <Text>官方</Text>
            </View>
            <Text className="notification_gate_card_title">{item.title}</Text>
            <Text className="notification_gate_card_content">{item.content}</Text>
            <Text className="notification_gate_card_time">{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotificationGateScreen;
