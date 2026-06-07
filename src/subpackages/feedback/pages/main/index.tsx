import { Button, Image, ScrollView, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';

import './index.scss';

import { sourceLabel, useFeedbackStore } from '@/store';

import { FeedbackIcon } from '@/common/assets/img/profile';
import searchIcon from '@/common/assets/img/search.png';
import { FloatButton, SearchInput } from '@/common/components';
import Loading from '@/common/components/Loading';
import { ROUTES } from '@/common/constants/routes';
import { NavigationBar } from '@/modules/navigation';
import type { SheetItem } from '@/subpackages/feedback/type';

import FAQItem from './components/normalFAQ';

const FeedbackPage = () => {
  const number = 576225292;
  const studentId = Taro.getStorageSync<string>('student_id');

  const navigate = useCallback((url: string) => void Taro.navigateTo({ url }), []);

  const [value, setValue] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const faqSource = useFeedbackStore((s) => s.faqSource);
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
      const FAQDatas = await useFeedbackStore.getState().loadFaq(studentId);
      setFullSheetData(FAQDatas);
      setSheetData(FAQDatas);
    } catch {
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
      await useFeedbackStore
        .getState()
        .updateFaqStatus(recordId, status === 'resolved', studentId);
      void Taro.showToast({
        icon: 'success',
        title: '反馈成功',
        duration: 1000,
      });
      return true;
    } catch (err: any) {
      if (err?.code === 200010) {
        void Taro.showToast({
          icon: 'none',
          title: '您已达到反馈次数上限，感谢您的反馈',
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

  const handleSearch = useCallback(() => {
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

  const handleSearchToggle = () => {
    // todos: 好像还不知道加什么
  };

  const handleNavigateToPage = (url: string) => {
    try {
      navigate(url);
    } catch (err) {
      console.error('跳转失败:', err);
    }
  };

  return (
    <View className="faq_page_container">
      <NavigationBar title="帮助与反馈" isBackToPage />
      <View className="faq_search_input_container">
        <SearchInput
          searchPlaceholder="请输入问题"
          style={{
            height: '30rpx',
            background: '#E5E7EB',
          }}
          searchPlaceholderStyle="color: #9CA3AF;"
          searchIconSrc={searchIcon}
          searchText={value}
          setSearchText={setValue}
          onSearchToggle={handleSearchToggle}
          onSearch={handleSearch}
          suffix={{
            text: '搜索',
          }}
        />
      </View>

      <View className="faq_content">
        <View className="faq_header">
          <Text className="faq_header_text">常见问题</Text>
          {sourceLabel(faqSource) && (
            <Text className="faq_offline_hint">{sourceLabel(faqSource)}</Text>
          )}
        </View>

        <ScrollView scrollY className="faq_scroll">
          {isLoading ? (
            <Loading text="搜索中..." />
          ) : sheetData.length ? (
            sheetData.map((item, index) => (
              <FAQItem
                key={item.record_id || index}
                item={item}
                isExpanded={expandedIndex === index}
                onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                onPress={(status) => handleFeedback(item.record_id, status)}
              />
            ))
          ) : (
            <View className="faq_empty">
              <Text>暂无相关问题</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View className="faq_bottom">
        <Button
          className="faq_button"
          onClick={() => handleNavigateToPage(ROUTES.feedback.write)}
        >
          <Text className="faq_button_text">我要反馈</Text>
        </Button>

        <View className="faq_group">
          <Text>课栈交流群：</Text>
          <Text className="faq_group_number">{number}</Text>
          <Text
            className="faq_copy"
            onClick={() => {
              void Taro.setClipboardData({
                data: String(number),
              }).then(() => {
                void Taro.showToast({ title: '已复制', icon: 'success', duration: 1000 });
              });
            }}
          >
            点击复制
          </Text>
        </View>
      </View>

      <FloatButton
        icon={<Image src={FeedbackIcon} className="faq_float_btn_icon" />}
        side="right"
        verticalOffset="78%"
        halfHidden
        onClick={() => handleNavigateToPage(ROUTES.feedback.history)}
      />
    </View>
  );
};

export default FeedbackPage;
