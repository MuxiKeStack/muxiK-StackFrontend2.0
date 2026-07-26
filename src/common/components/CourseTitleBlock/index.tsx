import { Text, View } from '@tarojs/components';
import { ReactNode } from 'react';

import './index.scss';

interface CourseTitleBlockProps {
  name: string;
  teacher?: string;
  layout?: 'stacked' | 'inline';
  trailing?: ReactNode;
  className?: string;
  onMainClick?: (e?: any) => void;
}

export default function CourseTitleBlock({
  name,
  teacher,
  layout = 'stacked',
  trailing,
  className,
  onMainClick,
}: CourseTitleBlockProps) {
  const showTeacher = Boolean(teacher?.trim());

  return (
    <View className={`course_title_block ${layout} ${className || ''}`}>
      <View
        className="course_title_block__main"
        onClick={
          onMainClick
            ? (e) => {
                e.stopPropagation();
                onMainClick(e);
              }
            : undefined
        }
      >
        <Text className="course_title_block__name" overflow="ellipsis">
          {name}
        </Text>
        {showTeacher && (
          <Text className="course_title_block__teacher" overflow="ellipsis">
            {teacher}
          </Text>
        )}
      </View>
      {trailing ? <View className="course_title_block__trailing">{trailing}</View> : null}
    </View>
  );
}
