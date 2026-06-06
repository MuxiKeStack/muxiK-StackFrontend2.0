import { Text, View } from '@tarojs/components';
import React from 'react';

import type { WebQuestionVo } from '@/common/types/userTypes';
import './index.scss';

interface Props {
  questionlist: WebQuestionVo[];
  onMoreClick: () => void;
  onEmptyClick: () => void;
  onQuestionClick: (question: WebQuestionVo) => void;
}

const QuestionsSection: React.FC<Props> = React.memo(
  ({ questionlist, onMoreClick, onEmptyClick, onQuestionClick }) => (
    <View className="classInfo_page_questions_section">
      <View className="classInfo_page_questions_title">问问同学</View>
      <View className="classInfo_page_questions_header">
        <Text className="classInfo_page_questions_header_title">有问题，问大家</Text>
        <Text className="classInfo_page_questions_header_more" onClick={onMoreClick}>
          查看更多
        </Text>
      </View>
      {questionlist.length > 0 ? (
        questionlist.slice(0, 2).map((question) => (
          <View
            key={question.id}
            className="classInfo_page_question_item"
            onClick={() => onQuestionClick(question)}
          >
            <View className="classInfo_page_question_title_row">
              <Text className="classInfo_page_question_mark">问</Text>
              <Text className="classInfo_page_question_title">{question.content}</Text>
              <Text className="classInfo_page_question_count">
                ({question.answer_cnt || 0}条)
              </Text>
            </View>
            <View className="classInfo_page_answer_preview">
              {question.preview_answers && question.preview_answers.length > 0 ? (
                question.preview_answers.slice(0, 2).map((answer, idx) => (
                  <View key={idx} className="classInfo_page_answer_item">
                    <Text className="classInfo_page_answer_mark">答</Text>
                    <Text className="classInfo_page_answer_content">
                      {answer.content}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="classInfo_page_answer_placeholder">
                  暂无回答，快来抢沙发
                </Text>
              )}
            </View>
          </View>
        ))
      ) : (
        <View className="classInfo_page_empty_questions" onClick={onEmptyClick}>
          <Text className="classInfo_page_empty_text">暂无问题，快去提问吧 》</Text>
        </View>
      )}
    </View>
  )
);

export default QuestionsSection;
