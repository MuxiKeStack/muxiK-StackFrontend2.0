import { Button, Image, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect } from 'react';

import './index.scss';

// eslint-disable-next-line import/first
import { editIcon } from '@/img/editPersonal';

const editInformationPage: React.FC = () => {
  let avatarUrl: string;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    void Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],
      success: function (res) {
        avatarUrl = res.tempFilePaths[0];
      },
    });
  }, []);
  return (
    <>
      <View>
        <View>
          <View>修改头像</View>
          <View>
            <Image src={avatarUrl}></Image>
          </View>
        </View>
        <View>
          <View>修改昵称</View>
          <View>nicheng</View>
          <View>{editIcon}</View>
        </View>
        <View>
          <View>称号</View>
          <View>
            <></>
            <></>
            <></>
          </View>
        </View>
        <View>
          <Button className="cancel-button">取消</Button>
          <Button className="save-button">保存</Button>
        </View>
      </View>
    </>
  );
};
export default editInformationPage;
