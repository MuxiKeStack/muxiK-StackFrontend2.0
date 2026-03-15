/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */

import { Button, Image, Input, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import './style.scss';

import { get } from '@/common/api/get';
import { fetchQiniuToken, fetchToQiniu } from '@/common/api/qiniu';
import { editIcon } from '@/common/assets/img/editPersonal';
import { TitleButton } from '@/common/components';
import { post } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

const Page: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickName, setNickName] = useState('请修改昵称');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editableNickName, setEditableNickName] = useState(nickName);
  const [selectedTitle, setSelectedTitle] = useState<string>('None');
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = '/users/profile';

        const response: ResponseUser = await get(url);
        setNickName(response.data.nickname);
        setAvatarUrl(response.data.avatar);
        setSelectedTitle(response.data.using_title);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setTitleOwnership(response.data.title_ownership);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    void fetchUser();
  }, []);
  const chooseAvatar = () => {
    void Taro.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        void fetchQiniuToken();
        const tempFilePath = res.tempFilePaths[0];
        // eslint-disable-next-line @typescript-eslint/no-shadow
        void fetchToQiniu(tempFilePath).then((res: string) => setAvatarUrl(res));
      },
      fail: function (res) {
        console.log(res);
      },
    });
  };
  const handleEditIconClick = () => {
    setIsEditingNickname(!isEditingNickname);
  };
  const handleNicknameChange = (e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const value = e.target.value;

    // 检查字符长度是否超过 7 个字
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (value.length <= 7) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setEditableNickName(value);
    } else {
      void Taro.showToast({
        icon: 'error',
        title: '昵称不能超过7个字',
      });
    }
  };

  const handleNicknameSave = () => {
    setNickName(editableNickName);
    setIsEditingNickname(false);
  };
  const handleSave = () => {
    void post('/users/edit', {
      avatar: avatarUrl,
      nickname: nickName,
      using_title: selectedTitle,
    }).then((res) => {
      void Taro.showToast({ icon: 'success', title: '保存成功' });
      setTimeout(() => {
        void Taro.switchTab({ url: '/pages/profile/index' });
      }, 1000);
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
  // Taro.redirectTo({url:'pages/login/index'});
  // const handleLogout = () => {
  //   void post('/users/logout', {});
  //   Taro.removeStorageSync('shortToken');
  //   Taro.removeStorageSync('visitor');
  //   void Taro.removeStorageSync('longToken');
  //   void Taro.reLaunch({ url: '/pages/login/index' });
  // };
  return (
    <View className="personal_edit_page">
      <NavigationBar title="修改个人信息" isBackToPage />

      <View className="avatar_container">
        <View className="avatar_text">修改头像</View>
        <Image src={avatarUrl} onClick={chooseAvatar} className="avatar1" />
      </View>

      <View className="divide_line" />

      <View className="nickname_container">
        <View className="nickname_text">昵称</View>
        <View>
          {isEditingNickname ? (
            <View className="nickname">
              <Input
                type="text"
                value={editableNickName}
                onInput={handleNicknameChange}
                onBlur={handleNicknameSave}
                className="nickname_input"
              />
            </View>
          ) : (
            <View className="nickname">
              {nickName}
              <Image
                src={editIcon}
                onClick={handleEditIconClick}
                className="editor_nickname"
              />
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
