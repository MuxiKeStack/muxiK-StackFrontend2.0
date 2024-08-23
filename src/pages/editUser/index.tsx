import { Button, Image, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import './index.scss';

// eslint-disable-next-line import/first
import { get } from '@/api/get';
// eslint-disable-next-line import/first
import { ResponseUser } from '@/pages/personalPage';

//import { useDoubleClick } from '@/hooks/useDoubleClick';

const EditUser: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  // const [editing, setEditing] = useState(false);
  const [nickName, setNickName] = useState('你好');
  // const [title, setTitle] = useState('');
  // const textOnDoubleClick = useDoubleClick();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const url = '/users/profile';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const response: ResponseUser = await get(url);
        console.log('用户信息');
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
      success: function (res) {
        console.log(res.tempFilePaths);
        setAvatarUrl(res.tempFilePaths[0]);
      },
      fail: function (res) {
        console.log(res);
      },
    });
  };
  return (
    <>
      <View>
        <View className="avatar-container">
          <View className="avatar-text">修改头像 </View>
          <Image src={avatarUrl} onClick={chooseAvatar} className="avatar"></Image>
        </View>
        <View className="nickname-container">
          <View className="nickname-text">昵称</View>
          <View>
            <View className="nickname">超级无敌{nickName}</View>
          </View>
        </View>
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
