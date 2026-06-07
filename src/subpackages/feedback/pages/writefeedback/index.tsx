import {
  Button,
  Image,
  Input,
  ScrollView,
  Text,
  Textarea,
  View,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useMemo, useState } from 'react';

import './index.scss';

import { useFeedbackStore } from '@/store';

import {
  FEEDBACK_TABLE_IDENTIFY,
  ISSUE_TYPE_MAP,
  MODULE_MAP,
} from '@/common/constants/feedback';
import { NavigationBar } from '@/modules/navigation';

type ImageItem = {
  uri: string;
  token?: string | null;
  uploading?: boolean;
};

const WriteFeedback = () => {
  const [selectedIssueType, setSelectedIssueType] = useState('function');
  const [selectedModule, setSelectedModule] = useState(MODULE_MAP.function[0]);
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentModules = useMemo(
    () => MODULE_MAP[selectedIssueType],
    [selectedIssueType]
  );

  const handleIssueTypeChange = (type: string) => {
    setSelectedIssueType(type);
    setSelectedModule(MODULE_MAP[type][0]);
  };

  const handleModuleChange = (module: string) => {
    setSelectedModule(module);
  };

  const handleDescriptionChange = useCallback((e: { detail: { value: string } }) => {
    const value = e.detail.value;
    if (value.length <= 200) setDescription(value);
  }, []);

  const uploadImageToFeishu = async (imagePath: string): Promise<string | null> => {
    const fileName = imagePath.split('/').pop() || `image_${Date.now()}.jpg`;
    return useFeedbackStore.getState().uploadImage(imagePath, fileName);
  };

  const handleSelectImage = async () => {
    try {
      const result = await Taro.chooseImage({
        count: 9,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
      });

      const tempFilePaths = result.tempFilePaths;
      if (tempFilePaths.length === 0) return;

      for (const filePath of tempFilePaths) {
        setImages((prev) => {
          if (prev.some((i) => i.uri === filePath)) return prev;
          return [...prev, { uri: filePath, uploading: true }];
        });

        void (async () => {
          const token = await uploadImageToFeishu(filePath);

          setImages((prev) =>
            prev.map((item) =>
              item.uri === filePath
                ? { ...item, token: token ?? null, uploading: false }
                : item
            )
          );

          if (!token) {
            setTimeout(() => {
              void Taro.showToast({
                title: '图片上传失败，请重试或删除该图片',
                icon: 'error',
              });
            }, 400);
          } else {
            void Taro.showToast({ title: '上传成功', icon: 'success', duration: 1500 });
          }
        })();
      }
    } catch (err: unknown) {
      console.error('选择图片出错:', err);

      void Taro.showToast({
        title: '选择图片失败，请检查相机权限后重试',
        icon: 'error',
      });
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const isSubmitEnabled = useMemo(() => {
    return (
      selectedIssueType &&
      selectedModule &&
      description.trim().length > 0 &&
      !images.some((i) => i.uploading)
    );
  }, [selectedIssueType, selectedModule, description, images]);

  const handleSubmit = async () => {
    if (!isSubmitEnabled || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const studentId = Taro.getStorageSync<string>('student_id');

      const fileTokens = images.map((img) => img.token).filter(Boolean);

      const requestData = {
        table_identify: FEEDBACK_TABLE_IDENTIFY,
        student_id: studentId,
        content: description,
        contact_info: contact,
        images: fileTokens,
        extra_record: {
          问题类型: selectedModule,
          问题来源: ISSUE_TYPE_MAP[selectedIssueType],
        },
      };

      await useFeedbackStore.getState().submitFeedback(requestData);
      void Taro.showToast({
        title: '提交成功,感谢您的反馈！',
        icon: 'success',
      });
      setDescription('');
      setContact('');
      setImages([]);
      setTimeout(() => {
        void Taro.navigateBack();
      }, 1500);
    } catch (err) {
      console.error(err);
      void Taro.showToast({
        title: '提交失败，请检查网络',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="feedback_container">
      <NavigationBar title="我要反馈" isBackToPage />

      <ScrollView scrollY className="feedback_scroll">
        <View className="feedback_section">
          <Text className="feedback_title">
            问题类型 <Text className="feedback_required">*</Text>
          </Text>
          <View className="feedback_options_row">
            <View
              className={`feedback_option ${selectedIssueType === 'function' ? 'feedback_selected' : ''}`}
              onClick={() => handleIssueTypeChange('function')}
            >
              <Text className="feedback_option_title">功能异常</Text>
              <Text className="feedback_option_desc">页面加载缓慢、无法使用、闪退</Text>
            </View>
            <View
              className={`feedback_option ${selectedIssueType === 'improvement' ? 'feedback_selected' : ''}`}
              onClick={() => handleIssueTypeChange('improvement')}
            >
              <Text className="feedback_option_title">产品改进</Text>
              <Text className="feedback_option_desc">界面优化、功能建议、体验提升</Text>
            </View>
          </View>
        </View>

        {/* 模块选择 */}
        <View className="feedback_section">
          <View className="feedback_options_wrap">
            {currentModules.map((module) => (
              <View
                key={module}
                className={`feedback_option feedback_small ${selectedModule === module ? 'feedback_selected' : ''}`}
                onClick={() => handleModuleChange(module)}
              >
                <Text>{module}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="feedback_section">
          <Text className="feedback_title">
            问题描述 <Text className="feedback_required">*</Text>
          </Text>
          <Textarea
            className="feedback_textarea"
            placeholder="请详细描述您遇到的问题..."
            value={description}
            onInput={handleDescriptionChange}
            maxlength={200}
          />
          <Text className="feedback_counter">{description.length}/200</Text>
        </View>

        <View className="feedback_section">
          <Text className="feedback_title">上传图片</Text>
          <ScrollView scrollX className="feedback_image_scroll">
            <View className="feedback_image_list">
              {images.map((img) => (
                <View key={img.uri} className="feedback_image_wrapper">
                  <Image src={img.uri} className="feedback_image_item" />
                  {img.uploading && (
                    <View className="feedback_image_overlay">上传中</View>
                  )}
                  <View
                    className="feedback_remove_btn"
                    onClick={() => handleRemoveImage(img.uri)}
                  >
                    <Text>×</Text>
                  </View>
                </View>
              ))}
              <View
                className={`feedback_image_add ${images.some((i) => i.uploading) ? 'feedback_disabled' : ''}`}
                onClick={() => void handleSelectImage()}
              >
                <Text>+</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <View className="feedback_section">
          <Text className="feedback_title">联系方式</Text>
          <Input
            className="feedback_input"
            type="text"
            placeholder="QQ/邮箱"
            value={contact}
            onInput={(e) => setContact(e.detail.value)}
          />
        </View>

        <Button
          className={`feedback_submit_btn ${!isSubmitEnabled || isSubmitting ? 'feedback_disabled' : ''}`}
          onClick={() => void handleSubmit()}
        >
          <Text className="feedback_submit_text">
            {isSubmitting ? '提交中...' : '提交'}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default WriteFeedback;
