import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React from 'react';

import './index.scss';

import { VirtualList } from '@/common/components';
import { ROUTES } from '@/common/constants/routes';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import type { WebQuestionVo } from '@/common/types/userTypes';

interface QAListProps {
  qas: WebQuestionVo[];
  courseId: string | null;
  onQuestionClick: (question: WebQuestionVo) => void;
}

const QAItem: React.FC<{
  data: WebQuestionVo[];
  index: number;
  onQuestionClick: (question: WebQuestionVo) => void;
}> = ({ data, index, onQuestionClick }) => {
  const qa = data[index];

  return (
    <View className="qa_list_item" onClick={() => onQuestionClick(qa)}>
      <View className="qa_item_header">
        <Text className="qa_item_mark">问</Text>
        <Text className="qa_item_title">{qa.content}</Text>
      </View>

      <View className="qa_item_replies">
        {qa.preview_answers?.slice(0, 1).map((answer) => (
          <View key={answer.id} className="qa_reply_item">
            <Text className="qa_reply_mark">答</Text>
            <Text className="qa_reply_content">{answer.content}</Text>
          </View>
        ))}
      </View>

      <View className="qa_item_footer">
        <Text className="qa_footer_text">共 {qa.answer_cnt || 0} 条回复</Text>
      </View>
    </View>
  );
};

const QAList: React.FC<QAListProps> = ({ qas, courseId, onQuestionClick }) => {
  const { guard } = useAuthGuard();

  const handleAsk = () => {
    if (!guard()) return;
    void Taro.navigateTo({
      url: `${ROUTES.course.publishQuestion}?course_id=${courseId}`,
    });
  };

  const Row = ({ data, index }: { data: WebQuestionVo[]; index: number }) => (
    <QAItem data={data} index={index} onQuestionClick={onQuestionClick} />
  );

  return (
    <View className="qa_list_container">
      <VirtualList
        height="50vh"
        width="100%"
        item={Row}
        itemData={qas}
        itemCount={qas.length}
        itemSize={200}
        getItemKey={(item) => item.id}
      />
      <View className="qa_publish_button_container">
        <Button className="qa_publish_button" onClick={handleAsk}>
          我要提问
        </Button>
      </View>
    </View>
  );
};

export default QAList;
