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

import { createFeedbackRecord } from '@/common/api/feedback';
import { uploadFileToFeishuBitable } from '@/common/api/feedback/uploadFeishu';
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
    try {
      const fileName = imagePath.split('/').pop() || `image_${Date.now()}.jpg`;

      const uploadResult = await uploadFileToFeishuBitable(imagePath, fileName);
      console.log('uploadResult:', uploadResult);

      if (uploadResult && uploadResult.data && uploadResult.data.file_token) {
        return uploadResult.data.file_token;
      } else {
        console.warn('上传缺少token', uploadResult);
        return null;
      }
    } catch (error: unknown) {
      console.error('上传图片出错:', error);
      return null;
    }
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
      console.log(studentId);

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

      const res = await createFeedbackRecord(requestData);

      if (res.code === 0 && res.data) {
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
      } else {
        void Taro.showToast({
          title: '提交失败,请稍后重试',
          icon: 'error',
        });
      }
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
    <View className="feedback-container">
      <NavigationBar title="我要反馈" isBackToPage />

      <ScrollView scrollY className="feedback-scroll">
        <View className="feedback-section">
          <Text className="feedback-title">
            问题类型 <Text className="required">*</Text>
          </Text>
          <View className="options-row">
            <View
              className={`option ${selectedIssueType === 'function' ? 'selected' : ''}`}
              onTouchStart={() => handleIssueTypeChange('function')}
            >
              <Text className="option-title">功能异常</Text>
              <Text className="option-desc">页面加载缓慢、无法使用、闪退</Text>
            </View>
            <View
              className={`option ${selectedIssueType === 'improvement' ? 'selected' : ''}`}
              onTouchStart={() => handleIssueTypeChange('improvement')}
            >
              <Text className="option-title">产品改进</Text>
              <Text className="option-desc">界面优化、功能建议、体验提升</Text>
            </View>
          </View>
        </View>

        {/* 模块选择 */}
        <View className="feedback-section">
          <View className="options-wrap">
            {currentModules.map((module) => (
              <View
                key={module}
                className={`option small ${selectedModule === module ? 'selected' : ''}`}
                onTouchStart={() => handleModuleChange(module)}
              >
                <Text>{module}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="feedback-section">
          <Text className="feedback-title">
            问题描述 <Text className="required">*</Text>
          </Text>
          <Textarea
            className="feedback-textarea"
            placeholder="请详细描述您遇到的问题..."
            value={description}
            onInput={handleDescriptionChange}
            maxlength={200}
          />
          <Text className="counter">{description.length}/200</Text>
        </View>

        <View className="feedback-section">
          <Text className="feedback-title">上传图片</Text>
          <ScrollView scrollX className="image-scroll">
            <View className="image-list">
              {images.map((img) => (
                <View key={img.uri} className="image-wrapper">
                  <Image src={img.uri} className="image-item" />
                  {img.uploading && <View className="image-overlay">上传中</View>}
                  <View
                    className="remove-btn"
                    onTouchStart={() => handleRemoveImage(img.uri)}
                  >
                    <Text>×</Text>
                  </View>
                </View>
              ))}
              <View
                className={`image-add ${images.some((i) => i.uploading) ? 'disabled' : ''}`}
                onTouchStart={() => void handleSelectImage()}
              >
                <Text>+</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <View className="feedback-section">
          <Text className="feedback-title">联系方式</Text>
          <Input
            className="input"
            type="text"
            placeholder="QQ/邮箱"
            value={contact}
            onInput={(e) => setContact(e.detail.value)}
          />
        </View>

        <Button
          className={`submit-btn ${!isSubmitEnabled || isSubmitting ? 'disabled' : ''}`}
          onClick={() => void handleSubmit()}
        >
          <Text className="submit-text">{isSubmitting ? '提交中...' : '提交'}</Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default WriteFeedback;
