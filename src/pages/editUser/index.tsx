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
import { ResponseUser } from '@/pages/personalPage';

//import { useDoubleClick } from '@/hooks/useDoubleClick';
// import { editIcon } from "@/img/editPersonal";

const EditUser: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  // const [editing, setEditing] = useState(false);
  const [nickName, setNickName] = useState('昵称昵称昵称');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editableNickName, setEditableNickName] = useState(nickName);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = '/users/profile';

        const response: ResponseUser = await get(url);
        console.log(response);
        setNickName(response.data.nickname);
        setAvatarUrl(response.data.avatar);
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
    setEditableNickName(e.target.value);
  };

  const handleNicknameSave = () => {
    setNickName(editableNickName);
    setIsEditingNickname(false);
  };
  return (
    <>
      <View>
        <View className="avatar-container">
          <View className="avatar-text">修改头像 </View>
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
                {/*<Image*/}
                {/*  src={editIcon}*/}
                {/*  onClick={handleEditIconClick}*/}
                {/*  className="editor-nickname"*/}
                {/*></Image>*/}
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
        {/*<View className="title-container">*/}
        {/*  <View className="title-text">称号</View>*/}
        {/*  <View className="title-container">*/}
        {/*    <TitleButton title="知心学长"></TitleButton>*/}
        {/*    <TitleButton title="课栈合伙人"></TitleButton>*/}
        {/*    <TitleButton title="知心学长"></TitleButton>*/}
        {/*  </View>*/}
        {/*</View>*/}
        <View className="button-container">
          <Button className="cancel-button">取消</Button>
          <Button className="save-button">保存</Button>
        </View>
        <View>
          <Button>退出登陆</Button>
        </View>
      </View>
    </>
  );
};
export default EditUser;
