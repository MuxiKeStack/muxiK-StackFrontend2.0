import { Image, ScrollView, Text, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';

import './index.scss';

import { getFeedbackImg } from '@/common/api/feedback';
import { STATUS_LABELS } from '@/common/constants/feedback';
import { NavigationBar } from '@/modules/navigation';

import { FeedbackDetailItem } from '../type';

const getStatusStep = (status: string) => {
  if (status === '待处理') return 1;
  if (status === '处理中') return 2;
  if (status === '已完成') return 3;
  return 1;
};

export default function FeedbackDetail() {
  const router = useRouter();
  const { item } = router.params as { item?: string };
  const [previewVisible, setPreviewVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [previewUri, setPreviewUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const feedbackItem = useMemo<FeedbackDetailItem | null>(() => {
    if (!item) return null;
    try {
      return JSON.parse(decodeURIComponent(item));
    } catch (error) {
      console.error('解析 feedbackItem 失败:', error);
      return null;
    }
  }, [item]);

  const statusClass = feedbackItem
    ? feedbackItem.fields.status === '待处理'
      ? 'pending'
      : feedbackItem.fields.status === '处理中'
        ? 'processing'
        : feedbackItem.fields.status === '已完成'
          ? 'resolved'
          : 'pending'
    : '';

  useEffect(() => {
    if (!feedbackItem) return;

    const tokens = feedbackItem.fields.screenshots
      .map((t) => t.file_token)
      .filter(Boolean) as string[];

    if (!tokens.length) {
      setImageUrls([]);
      return;
    }

    setIsLoading(true);
    getFeedbackImg({ file_tokens: tokens })
      .then((res: any) => {
        if (res.code === 0 && Array.isArray(res.data?.files)) {
          const map: Record<string, string> = {};
          res.data.files.forEach((it: any) => {
            if (it?.file_token && it?.tmp_download_url) {
              map[it.file_token] = it.tmp_download_url;
            }
          });
          setImageUrls(tokens.map((t) => map[t] || ''));
        } else {
          void Taro.showToast({ title: '获取图片失败', icon: 'error' });
          setImageUrls(tokens.map(() => ''));
        }
      })
      .catch(() => {
        setImageUrls(tokens.map(() => ''));
      })
      .finally(() => setIsLoading(false));
  }, [feedbackItem]);

  if (!feedbackItem) {
    return (
      <View className="detail-container">
        <Text className="error-text">数据加载失败</Text>
      </View>
    );
  }

  const statusStep = getStatusStep(feedbackItem.fields.status);
  const contentText = feedbackItem.fields.content;
  const isLongContent = contentText.length > 133;
  const displayText =
    !isLongContent || expanded ? contentText : `${contentText.slice(0, 100)}...`;

  return (
    <View className="feedback_detail_container">
      <NavigationBar title="反馈历史" isBackToPage />

      {/* 进度条 */}
      <View className="feedback_detail_progress_container">
        {[1, 2, 3].map((step, i) => (
          <View key={step} className="feedback_detail_progress_step">
            <View
              className={`feedback_detail_circle ${statusStep === step ? 'feedback_detail_active' : ''}`}
            >
              <Text className="feedback_detail_circle_text">{step}</Text>
            </View>
            <Text
              className={`feedback_detail_step_label ${statusStep === step ? 'feedback_detail_active' : ''}`}
            >
              {STATUS_LABELS[i]}
            </Text>
            {i < 2 && (
              <View className="feedback_detail_connector_container">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <View key={bar} className="feedback_detail_connector_bar" />
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <ScrollView className="feedback_detail_content">
        <View className="feedback_detail_card">
          <View className="feedback_detail_info_row">
            <Text className="feedback_detail_info_label">问题类型</Text>
            <View className="feedback_detail_type_tags">
              <View className="feedback_detail_tag">
                <Text className="feedback_detail_tag_text">
                  {feedbackItem.fields.source}
                </Text>
              </View>
              <View className="feedback_detail_tag">
                <Text className="feedback_detail_tag_text">
                  {feedbackItem.fields.type}
                </Text>
              </View>
            </View>
          </View>

          <View className="feedback_detail_info_row">
            <Text className="feedback_detail_info_label">进度</Text>
            <View className={`feedback_detail_status_bg ${statusClass}`}>
              <Text className={`feedback_detail_status_text ${statusClass}`}>
                {feedbackItem.fields.status}
              </Text>
            </View>
          </View>

          <View className="feedback_detail_info_row">
            <Text className="feedback_detail_info_label">时间</Text>
            <Text className="feedback_detail_time_text">
              {feedbackItem.fields.submitTime}
            </Text>
          </View>

          <View className="feedback_detail_section">
            <Text className="feedback_detail_section_title">问题描述</Text>
            <View onClick={() => isLongContent && setExpanded(!expanded)}>
              <Text className="feedback_detail_section_text">{displayText}</Text>
              {isLongContent && !expanded && (
                <Text className="feedback_detail_section_expand_text">点击查看全部</Text>
              )}
            </View>
            <View className="feedback_detail_reply_container">
              <Text className="feedback_detail_reply_text">
                回复：{feedbackItem.fields.reply}
              </Text>
            </View>
          </View>

          <View className="feedback_detail_section">
            <Text className="feedback_detail_section_title">问题截图</Text>
            {imageUrls.length === 0 ? (
              <Text className="feedback_detail_section_text">暂无图片</Text>
            ) : (
              <ScrollView scrollX className="feedback_detail_image_scroll">
                {isLoading ? (
                  <Text className="feedback_detail_loading_text">加载中…</Text>
                ) : (
                  imageUrls.map((uri, idx) => (
                    <Image
                      key={idx}
                      className="feedback_detail_image_item"
                      src={uri}
                      onClick={() => {
                        setPreviewUri(uri);
                        setPreviewVisible(true);
                      }}
                    />
                  ))
                )}
              </ScrollView>
            )}
          </View>

          <View className="feedback_detail_section">
            <Text className="feedback_detail_section_title">联系方式</Text>
            <Text className="feedback_detail_section_text">
              {feedbackItem.fields.contact || '暂无联系方式'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {previewVisible && (
        <View
          className="feedback_detail_image_preview_overlay"
          onClick={() => setPreviewVisible(false)}
        >
          <Image
            className="feedback_detail_image_preview"
            src={previewUri}
            mode="aspectFit"
          />
        </View>
      )}
    </View>
  );
}
