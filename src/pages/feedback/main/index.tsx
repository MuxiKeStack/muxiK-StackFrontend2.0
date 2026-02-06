import { Button, ScrollView, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';

import './style.scss';

import { feedbackFAQ, getFAQ } from '@/common/api/feedback';
import Loading from '@/common/components/Loading';
import SearchBar from '@/common/components/SearchBar';
import { FAQ_RECORD_NAMES, FAQ_TABLE_IDENTIFY } from '@/common/constants/feedback';
import { NavigationBar } from '@/modules/navigation';

import { SheetItem } from '../type';
import FAQItem from './components/normalquestions';

interface FAQRecord {
  record_id: string;
  record: {
    问题名称?: string;
    问题描述?: string;
    解决方案?: string;
  };
  is_resolved?: '已解决' | '未解决' | '未选择';
}

const transformFAQToSheetData = (records: FAQRecord[]): SheetItem[] => {
  return records.map((item) => ({
    record_id: item.record_id,
    fields: {
      title: item.record['问题名称'] || '未命名问题',
      description: item.record['问题描述'] || '暂无',
      solution: item.record['解决方案'] || '暂无',
      resolvedStatus:
        item.is_resolved === '已解决'
          ? 'resolved'
          : item.is_resolved === '未解决'
            ? 'unresolved'
            : 'notSelected',
    },
  }));
};

const FeedbackPage = () => {
  const number = 576225292;
  const studentId = Taro.getStorageSync<string>('student_id');

  const navigate = useCallback((url: string) => void Taro.navigateTo({ url }), []);

  const [value, setValue] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [sheetData, setSheetData] = useState<SheetItem[]>([]);
  const [fullSheetData, setFullSheetData] = useState<SheetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getFeedbackFAQs = useCallback(async () => {
    if (!studentId) {
      void Taro.showToast({
        icon: 'error',
        title: '请先登录再反馈',
        duration: 1500,
      });
      return;
    }

    try {
      setIsLoading(true);
      const query = {
        student_id: studentId,
        record_names: FAQ_RECORD_NAMES,
        table_identify: FAQ_TABLE_IDENTIFY,
      };

      const res: any = await getFAQ(query);

      if (res.code === 0) {
        const FAQDatas = transformFAQToSheetData(res.data.records);
        setFullSheetData(FAQDatas);
        setSheetData(FAQDatas);
      } else {
        void Taro.showToast({
          icon: 'error',
          title: '获取常见问题失败',
          duration: 1500,
        });
      }
    } catch (err) {
      void Taro.showToast({
        icon: 'error',
        title: '网络异常，请稍后再试',
        duration: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void getFeedbackFAQs();
  }, [getFeedbackFAQs]);

  const handleFeedback = async (recordId: string, status: string): Promise<boolean> => {
    try {
      const params = {
        table_identify: FAQ_TABLE_IDENTIFY,
        record_id: recordId,
        is_resolved: status === 'resolved',
        resolved_field_name: '已解决',
        unresolved_field_name: '未解决',
        user_id: studentId,
      };

      const res = await feedbackFAQ(params);

      if (res?.code === 0) {
        void Taro.showToast({
          icon: 'success',
          title: '反馈成功',
          duration: 1000,
        });
        return true;
      }

      void Taro.showToast({
        icon: 'error',
        title: '反馈失败，请重试',
        duration: 1000,
      });
      return false;
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.code === 200010) {
        void Taro.showToast({
          icon: 'none',
          title: '您已达到反馈次数上限，感谢您的反馈',
          duration: 1000,
        });
        return false;
      }

      if (err.response?.status === 429) {
        void Taro.showToast({
          icon: 'none',
          title: '操作过于频繁，请稍后再试',
          duration: 1000,
        });
        return false;
      }

      void Taro.showToast({
        icon: 'error',
        title: '网络异常，请稍后再试',
        duration: 1000,
      });
      return false;
    }
  };

  const debouncedSearch = useCallback(() => {
    let timeoutId: any;
    return (searchValue: string) => {
      setIsLoading(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const lowerSearch = searchValue.toLowerCase().trim();
        if (!lowerSearch) {
          setSheetData(fullSheetData);
        } else {
          const filtered = fullSheetData.filter((item) => {
            const { title, description, solution } = item.fields;
            return (
              title.toLowerCase().includes(lowerSearch) ||
              description.toLowerCase().includes(lowerSearch) ||
              solution.toLowerCase().includes(lowerSearch)
            );
          });
          setSheetData(filtered);
        }
        setIsLoading(false);
      }, 300);
    };
  }, [fullSheetData])();

  const navigateToPage = (url: string) => {
    try {
      navigate(url);
    } catch (err) {
      console.error('导航失败:', err);
    }
  };

  return (
    <View className="faq-container">
      <NavigationBar title="帮助与反馈" isBackToPage />

      <View className="searchBar">
        <SearchBar
          placeholder="请输入问题"
          value={value}
          onChange={(val) => {
            setValue(val);
            debouncedSearch(val);
          }}
        />
      </View>

      <View className="content">
        <View className="header">
          <Text className="header-text">常见问题</Text>
        </View>

        <ScrollView scrollY className="scroll">
          {isLoading ? (
            <Loading text="搜索中..." />
          ) : sheetData.length ? (
            sheetData.map((item, index) => (
              <FAQItem
                key={item.record_id || index}
                title={item.fields.title}
                content={item.fields.description}
                solution={item.fields.solution}
                isExpanded={expandedIndex === index}
                onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                initialStatus={item.fields.resolvedStatus}
                onPress={(status) => handleFeedback(item.record_id, status)}
              />
            ))
          ) : (
            <View className="empty">
              <Text>暂无相关问题</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View className="bottom">
        <Button
          className="button"
          onClick={() => navigateToPage('/pages/feedback/writefeedback/index')}
        >
          <Text className="button-text">我要反馈</Text>
        </Button>

        <View className="group">
          <Text>课栈交流群：</Text>
          <Text className="group-number">{number}</Text>
          <Text
            className="copy"
            onClick={() => navigateToPage('/pages/feedback/history/index')}
          >
            点击复制
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FeedbackPage;
