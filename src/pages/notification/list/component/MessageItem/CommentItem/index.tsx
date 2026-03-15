import CourseLabel from '@/common/components/CourseLabel';
import { CommentMessageProps } from '@/pages/notification/type';
import { Text, View } from '@tarojs/components';
import { memo } from 'react';
import './index.scss';

export const CommentMessageItem: React.FC<CommentMessageProps> = memo(
  ({ title, teacher, composite_score, courseType, reply }) => {
    const handleCommentClick = () => {};

    const ContentComponent = (
      <View className="comment_content_container">
        <View className="reply_container">
          <Text className="reply_content">{reply}</Text>
        </View>
        <View className="comment_info_container" onClick={handleCommentClick}>
          {/* todos: 看后端怎么传吧，这里得记录评论数，type后面应该还要改 */}
          <Text className="comment_info_text">共一个回答&nbsp;→</Text>
        </View>
      </View>
    );

    return (
      <CourseLabel
        id={`${title}-${teacher}`}
        name={title}
        teacher={teacher}
        composite_score={composite_score}
        courseType={courseType}
        FooterComponent={ContentComponent}
      />
    );
  }
);
