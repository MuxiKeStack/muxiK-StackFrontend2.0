/* eslint-disable no-console */
import { View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import './index.scss';

type OfficialNotificationProps = object;
type ImageDetailProps = {
  title: string;
  description: string;
};
type AlertDetailProps = {
  alert: string;
};

const OfficialNotification: React.FC<OfficialNotificationProps> = () => {
  useLoad(() => {
    console.log('Page loaded.');
  });

  const [isImageDetail] = useState(true);
  const [notificationTime] = useState('07:25');
  const [notificationTitle] = useState('评课活动要开始了');
  const [notificationDescription] = useState('摘要');
  const [notificationAlert] = useState('您在高等数学下方的评论违规，请注意您的发言');

  return (
    <View className="OfficialNotification">
      <View className="officialnotification_notification">
        <View className="officialnotification_time">{notificationTime}</View>
        {isImageDetail ? (
          <ImageDetail title={notificationTitle} description={notificationDescription} />
        ) : (
          <AlertDetail alert={notificationAlert} />
        )}
      </View>
      <View className="officialnotification_notification">
        <View className="officialnotification_time">{notificationTime}</View>
        <AlertDetail alert={notificationAlert} />
      </View>
    </View>
  );
};

const ImageDetail: React.FC<ImageDetailProps> = ({ title, description }) => {
  return (
    <>
      <View className="officialnotification_detail">
        <View className="officialnotification_image"></View>
        <View className="officialnotification_text">
          <View className="officialnotification_title">{title}</View>
          <View className="officialnotification_description">{description}</View>
        </View>
      </View>
    </>
  );
};

const AlertDetail: React.FC<AlertDetailProps> = ({ alert }) => {
  return (
    <>
      <View className="officialnotification_alert">
        <View className="officialnotification_alert_text">{alert}</View>
      </View>
    </>
  );
};

export default OfficialNotification;
