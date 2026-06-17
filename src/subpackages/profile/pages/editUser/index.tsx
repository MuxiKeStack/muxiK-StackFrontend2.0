/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */

import { Button, Image, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useRef, useState } from 'react';

import './index.scss';

import { useUserStore } from '@/store';

import { editIcon } from '@/common/assets/img/editPersonal';
import { Avatar, TitleButton } from '@/common/components';
import { fetchQiniuToken, fetchToQiniu } from '@/common/request/qiniu';
import { NavigationBar } from '@/modules/navigation';

const NICKNAME_MAX_LENGTH = 7;

const Page: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickName, setNickName] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editableNickName, setEditableNickName] = useState('');
  const [selectedTitle, setSelectedTitle] = useState<string>('None');
  const saveNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [titleOwnership, setTitleOwnership] = useState({
    CCNUWithMe: false,
    CaringSenior: false,
    KeStackPartner: false,
    None: false,
  });

  const titleRequirements = {
    CaringSenior: 80,
    KeStackPartner: 150,
    CCNUWithMe: 300,
  };

  const mountedRef = useRef(true);

  useEffect(() => {
    const fetchUser = async () => {
      const profile = await useUserStore.getState().ensureProfile();
      if (!mountedRef.current || !profile) return;
      if (typeof profile.nickname === 'string') {
        setNickName(profile.nickname);
        setEditableNickName(profile.nickname);
      }
      if (typeof profile.avatar === 'string') setAvatarUrl(profile.avatar);
      if (profile.using_title) setSelectedTitle(profile.using_title);
      if (profile.title_ownership) setTitleOwnership(profile.title_ownership as any);
    };
    void fetchUser();
    return () => {
      mountedRef.current = false;
      if (saveNavTimerRef.current) clearTimeout(saveNavTimerRef.current);
    };
  }, []);

  const chooseAvatar = () => {
    void Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        void fetchQiniuToken();
        const tempFilePath = res.tempFilePaths[0];
        (fetchToQiniu(tempFilePath) as Promise<string>).then((r) => setAvatarUrl(r));
      },
      fail: () => {
        void Taro.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  };

  const handleEditIconClick = () => {
    if (!isEditingNickname) {
      setEditableNickName(nickName);
      setIsEditingNickname(true);
    } else {
      setIsEditingNickname(false);
    }
  };

  const handleNicknameChange = (e: any) => {
    setEditableNickName(e.detail.value);
  };

  const handleNicknameSave = () => {
    setNickName(editableNickName);
    setIsEditingNickname(false);
  };

  const handleSave = () => {
    void useUserStore
      .getState()
      .updateProfile({
        avatar: avatarUrl,
        nickname: nickName,
        using_title: selectedTitle,
      })
      .then(() => {
        void Taro.showToast({ icon: 'success', title: '保存成功' });
        if (saveNavTimerRef.current) clearTimeout(saveNavTimerRef.current);
        saveNavTimerRef.current = setTimeout(() => {
          void Taro.switchTab({ url: '/pages/profile/index' });
        }, 1000);
      })
      .catch(() => {
        void Taro.showToast({ icon: 'error', title: '保存失败' });
      });
  };

  const handleCancel = () => {
    void Taro.switchTab({ url: '/pages/profile/index' });
  };

  const handleTitleSelect = (title: string) => {
    if (titleOwnership[title]) {
      setSelectedTitle(title);
    } else {
      const requirement = titleRequirements[title];
      let titleName = '';
      switch (title) {
        case 'CaringSenior':
          titleName = '知心学长';
          break;
        case 'KeStackPartner':
          titleName = '课栈合伙人';
          break;
        case 'CCNUWithMe':
          titleName = '华师有我';
          break;
      }
      void Taro.showModal({
        title: '称号获取条件',
        content: `经验值达到${requirement}，可获得"${titleName}"称号`,
        showCancel: false,
        confirmText: '知道了',
      });
    }
  };

  return (
    <View className="personal_edit_page">
      <NavigationBar title="修改个人信息" isBackToPage />

      <View className="avatar_container">
        <View className="avatar_text">修改头像</View>
        <Avatar src={avatarUrl} size="8vh" className="eu_avatar" onClick={chooseAvatar} />
      </View>

      <View className="divide_line" />

      <View className="nickname_container">
        <View className="nickname_text">昵称</View>
        <View>
          {isEditingNickname ? (
            <View className="nickname_edit_wrapper">
              <Input
                type="text"
                value={editableNickName}
                placeholder="请修改昵称"
                maxlength={NICKNAME_MAX_LENGTH}
                onInput={handleNicknameChange}
                onBlur={handleNicknameSave}
                className="nickname_input"
              />
              <Text className="nickname_count">
                {editableNickName.length}/{NICKNAME_MAX_LENGTH}
              </Text>
            </View>
          ) : (
            <View className="nickname">
              {nickName || '未设置'}
              <View className="editor_nickname_hit" onClick={handleEditIconClick}>
                <Image src={editIcon} className="editor_nickname" />
              </View>
            </View>
          )}
        </View>
      </View>

      <View className="divide_line" />

      <View className="title_section">
        <View className="title_text">称号</View>
        <View className="title_buttons">
          <TitleButton
            title="知心学长"
            onClick={() => handleTitleSelect('CaringSenior')}
            isSelected={selectedTitle === 'CaringSenior'}
            isDisabled={!titleOwnership.CaringSenior}
          />
          <TitleButton
            title="课栈合伙人"
            onClick={() => handleTitleSelect('KeStackPartner')}
            isSelected={selectedTitle === 'KeStackPartner'}
            isDisabled={!titleOwnership.KeStackPartner}
          />
          <TitleButton
            title="华师有我"
            onClick={() => handleTitleSelect('CCNUWithMe')}
            isSelected={selectedTitle === 'CCNUWithMe'}
            isDisabled={!titleOwnership.CCNUWithMe}
          />
        </View>
      </View>

      <View className="divide_line" />

      <View className="button_container">
        <Button className="action_button action_button_cancel" onClick={handleCancel}>
          取消
        </Button>
        <Button className="action_button action_button_save" onClick={handleSave}>
          保存
        </Button>
      </View>
    </View>
  );
};

export default Page;
