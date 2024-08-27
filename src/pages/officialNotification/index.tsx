import { View } from '@tarojs/components';
import { useState } from 'react';

import './index.scss';

interface OfficialNotificationProps {}

interface OfficialProps {
  title: string;
  description?: string;
}

const OfficialNotification: React.FC<OfficialNotificationProps> = () => {
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
          <AlertDetail title={notificationAlert} />
        )}
      </View>
      <View className="officialnotification_notification">
        <View className="officialnotification_time">{notificationTime}</View>
        <AlertDetail title={notificationAlert} />
      </View>
    </View>
  );
};

const ImageDetail: React.FC<OfficialProps> = ({ title, description }) => (
  <View className="officialnotification_detail">
    <View className="officialnotification_image"></View>
    <View className="officialnotification_text">
      <View className="officialnotification_title">{title}</View>
      <View className="officialnotification_description">{description}</View>
    </View>
  </View>
);

const AlertDetail: React.FC<OfficialProps> = ({ title }) => (
  <View className="officialnotification_alert">
    <View className="officialnotification_alert_text">{title}</View>
  </View>
);

export default OfficialNotification;
