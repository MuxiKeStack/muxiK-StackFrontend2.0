import { ScrollView, Text, View } from '@tarojs/components';

import { NavigationBar } from '@/modules/navigation';

import './index.scss';

const TABS = ['全部', '专业', '个性', '通核'] as const;

const NOTICES = [
  {
    title: '关于木犀课栈',
    body: '木犀课栈是面向华中师范大学学生的课程信息辅助工具，帮助同学们便捷查询课程资料与选课相关信息。',
  },
  {
    title: '使用说明',
    body: '可在底部「手册」查看选课指引。课程信息请以学校教务系统与教务处官方通知为准。',
  },
  {
    title: '服务公告',
    body: '平台持续优化中，部分功能将陆续开放。如有疑问，可通过「我的」-「意见反馈」联系团队。',
  },
] as const;

const PlazaGateScreen: React.FC = () => {
  return (
    <View className="plaza_gate">
      <NavigationBar title="评课广场" isBackToPage />

      <View className="plaza_gate_tabs">
        {TABS.map((label, index) => (
          <View
            key={label}
            className={`plaza_gate_tab ${index === 0 ? 'plaza_gate_tab_active' : ''}`}
          >
            <Text>{label}</Text>
          </View>
        ))}
        <View className="plaza_gate_search">
          <Text>搜索</Text>
        </View>
      </View>

      <ScrollView scrollY className="plaza_gate_scroll">
        <View className="plaza_gate_intro">
          <Text className="plaza_gate_intro_title">木犀课栈 · 课程服务</Text>
          <Text className="plaza_gate_intro_desc">
            以下为平台官方说明，内容定期更新。
          </Text>
        </View>

        {NOTICES.map((item) => (
          <View key={item.title} className="plaza_gate_card">
            <Text className="plaza_gate_card_title">{item.title}</Text>
            <Text className="plaza_gate_card_body">{item.body}</Text>
            <Text className="plaza_gate_card_tag">官方</Text>
          </View>
        ))}

        <View className="plaza_gate_footer">
          <Text>—— 木犀网络工作室 ——</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlazaGateScreen;
