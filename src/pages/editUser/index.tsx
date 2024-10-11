/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */
/* eslint-disable import/first */
import { Button, Image, Input, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import './index.scss';

import { get } from '@/common/api/get';
import { fetchQiniuToken, fetchToQiniu } from '@/common/api/qiniu';
import { editIcon } from '@/common/assets/img/editPersonal';
import { TitleButton } from '@/common/components';
import { post } from '@/common/utils';

const EditUser: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  // const [editing, setEditing] = useState(false);
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
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = '/users/profile';

        const response: ResponseUser = await get(url);
        console.log(response);
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
        console.log(res);
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
    void post(
      '/users/edit',
      { avatar: avatarUrl, nickname: nickName, using_title: selectedTitle },
      true
    ).then((res) => {
      console.log(res);
      void Taro.showToast({ icon: 'success', title: '保存成功' });
      setTimeout(() => {
        void Taro.switchTab({ url: '/pages/profile/index' });
      }, 1000);
    });
  };
  const handleTitleSelect = (title: string) => {
    if (titleOwnership[title]) {
      setSelectedTitle(title);
    }
  };
  // Taro.redirectTo({url:'pages/login/index'});
  const handleLogout = () => {
    void post('/users/logout', {}, true).then((res) => console.log(res));
    void Taro.removeStorage({
      key: 'shortToken',
      success: (res) => console.log(res),
      fail: (err) => console.log(err),
    });
    void Taro.removeStorage({
      key: 'longToken',
      success: (res) => console.log(res),
      fail: (err) => console.log(err),
    });
    void Taro.reLaunch({ url: '/pages/login/index' });
  };
  return (
    <View>
      <View className="avatar-container">
        <View className="avatar-text">修改头像</View>
        <Image src={avatarUrl} onClick={chooseAvatar} className="avatar"></Image>
      </View>
      <View className="divide-line"></View>
      <View className="nickname-container">
        <View className="nickname-text">昵称</View>
        <View>
          {isEditingNickname ? (
            <View className="nickname">
              <Input
                type="text"
                value={editableNickName}
                onInput={handleNicknameChange}
                onBlur={handleNicknameSave}
                className="nickname-input"
              />
            </View>
          ) : (
            <View className="nickname">
              {nickName}
              <Image
                src={editIcon}
                onClick={handleEditIconClick}
                className="editor-nickname"
              ></Image>
            </View>
          )}
        </View>
      </View>
      <View className="divide-line"></View>
      <View className="title-container">
        <View className="title-text">称号</View>
        <View className="title-container">
          <TitleButton
            title="知心学长"
            onClick={() => handleTitleSelect('CaringSenior')}
            isSelected={selectedTitle === 'CaringSenior'}
            isDisabled={!titleOwnership.CaringSenior}
          ></TitleButton>
          <TitleButton
            title="课栈合伙人"
            onClick={() => handleTitleSelect('KeStackPartner')}
            isSelected={selectedTitle === 'KeStackPartner'}
            isDisabled={!titleOwnership.KeStackPartner}
          ></TitleButton>
          <TitleButton
            title="华师有我"
            onClick={() => handleTitleSelect('CCNUWithMe')}
            isSelected={selectedTitle === 'CCNUWithMe'}
            isDisabled={!titleOwnership.CCNUWithMe}
          ></TitleButton>
        </View>
      </View>
      <View className="flex">
        <Button className="cancel-button">取消</Button>
        <Button className="save-button" onClick={handleSave}>
          保存
        </Button>
      </View>
      <Button className="mt-7 h-1/6 w-1/3" onClick={handleLogout}>
        退出登陆
      </Button>
    </View>
  );
};

export default EditUser;
