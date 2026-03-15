import { ScrollView, Text, View } from '@tarojs/components';
import React from 'react';
import './index.scss';

interface QAListProps {
  qas: WebQuestionVo[];
}

const QAItem: React.FC<{ qa: WebQuestionVo }> = ({ qa }) => {
  return (
    <View className="qa_list_item">
      <View className="qa_item_header">
        <Text className="qa_item_mark">问</Text>
        <Text className="qa_item_title">{qa.content}</Text>
      </View>

      <View className="qa_item_replies">
        {qa.preview_answers?.slice(0, 1).map((answer) => (
          <View key={answer.id} className="qa_reply_item">
            {/* {answer.avatar ? (
              <Image src={answer.avatar} className="qa_reply_avatar_image" />
            ) : ( */}
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

const QAList: React.FC<QAListProps> = ({ qas }) => {
  return (
    <ScrollView className="qa_list_scroll" scrollY>
      <View className="qa_list_container">
        {qas.map((question) => (
          <QAItem key={question.id} qa={question} />
        ))}
      </View>
    </ScrollView>
  );
};

export default QAList;
