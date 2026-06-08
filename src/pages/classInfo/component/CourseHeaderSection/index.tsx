import { Image, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

import StarIcon from '@/common/assets/img/profile/star_icon.png';

interface Props {
  name?: string;
  collect?: boolean;

  onCollect: () => void;
}

const CourseHeaderSection: React.FC<Props> = React.memo(
  ({ name, collect, onCollect }) => (
    <View className="classInfo_page_header_container">
      <View className="classInfo_page_course_name">{name || ''}</View>
      {collect !== undefined && (
        <View className="classInfo_page_collect_icon_wrapper" onClick={onCollect}>
          <Image
            src={StarIcon}
            style={{
              width: '34rpx',
              height: '32rpx',
              opacity: collect ? 1 : 0.3,
            }}
            mode="aspectFit"
          />
        </View>
      )}
    </View>
  )
);

export default CourseHeaderSection;
