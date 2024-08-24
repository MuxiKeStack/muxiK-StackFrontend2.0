import { Button, Icon, Image, Input, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import './index.scss';

// eslint-disable-next-line import/first
import { get } from '@/api/get';
// eslint-disable-next-line import/first
import { ResponseUser } from '@/pages/personalPage';

//import { useDoubleClick } from '@/hooks/useDoubleClick';
// import { editIcon } from "@/img/editPersonal";
export interface ResponseQiniu {
  code?: number;
  data?: WebGetTubeTokenData;
  msg?: string;
}
interface QiniuUploadData {
  token: string;
  key?: string;
}
interface QiniuUploadResponse {
  key: string;
  hash: string;
}
export interface WebGetTubeTokenData {
  access_token?: string;
  domain_name?: string;
}
const EditUser: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  // const [editing, setEditing] = useState(false);
  const [nickName, setNickName] = useState('昵称昵称昵称');
  const [uploadToken, setUploadToken] = useState<string | undefined>();
  const [uploadDomain, setUploadDomain] = useState<string | undefined>();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editableNickName, setEditableNickName] = useState(nickName);
  // const [title, setTitle] = useState('');
  // const textOnDoubleClick = useDoubleClick();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = '/users/profile';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: ResponseUser = await get(url);
        console.log(response);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    void fetchUser();
  }, []);
  useEffect(() => {
    const fetchQiniuToken = async () => {
      try {
        const url = '/tube/access_token';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: ResponseQiniu = await get(url);
        if (response.code) {
          setUploadToken(response.data?.access_token);
          setUploadDomain(response.data?.domain_name);
        }
      } catch (error) {
        console.error('Error fetching Qiniu token:', error);
      }
    };
    void fetchQiniuToken();
  }, []);
  const chooseAvatar = () => {
    void Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths[0];
        setAvatarUrl(filePath);
        console.log(res);
        if (uploadToken && uploadDomain) {
          uploadToQiniu(filePath);
        }
      },
      fail: (err) => {
        console.error('Failed to choose image:', err);
      },
    });
  };

  const uploadToQiniu = (filePath: string) => {
    const data: QiniuUploadData = {
      token: uploadToken as string,
    };

    void Taro.uploadFile({
      url: `https://${uploadDomain}`,
      filePath: filePath,
      name: 'file',
      formData: data,
      success: (res) => {
        if (res.statusCode === 200) {
          const responseData: QiniuUploadResponse = JSON.parse(
            res.data
          ) as QiniuUploadResponse;
          const imageUrl = `https://${uploadDomain}/${responseData.key}`;
          console.log(imageUrl);
          setAvatarUrl(imageUrl);
        } else {
          console.error('Upload failed:', res);
        }
      },
      fail: (err) => {
        console.error('Error during upload:', err);
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
              <Input
                type="text"
                value={editableNickName}
                onInput={handleNicknameChange}
                onBlur={handleNicknameSave}
                className="nickname-input"
              />
            ) : (
              <View className="nickname">
                {nickName}
                <Icon type="info" size="20" onClick={handleEditIconClick} />
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
