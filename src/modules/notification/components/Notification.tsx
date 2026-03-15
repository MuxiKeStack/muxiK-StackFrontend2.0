import { VirtualList } from '@/common/components';
import { formatDate, get, getUserInfo } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';
import { NavigationBar } from '@/modules/navigation';
import { StatusResponse } from '@/pages/evaluate';
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import './index.scss';
import { MessageItem, OfficialItem } from './Items';
import {
  MOCK_COMMENT_MESSAGES,
  MOCK_OFFICIAL_MESSAGES,
  MOCK_SUPPORT_MESSAGES,
} from './mock';
import TabBar from './TabBar';
import type { Message as MessageType } from './types';

const Notification: React.FC = memo(() => {
  const [tab, setTab] = useState<string>('提问');
  const [commentMessage, setCommentMessage] = useState<MessageType[]>([]);
  const [supportMessage, setSupportMessage] = useState<MessageType[]>([]);
  const [officialMessage, setOfficialMessage] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [ctime, setCtime] = useState<number>(0);
  const [end, setEnd] = useState(false);
  const [test, setTest] = useState<boolean>(false);

  const currentMessage = useMemo(() => {
    const msg = tab === '提问' ? commentMessage : tab === '点赞' ? supportMessage : [];
    if (!msg || !msg.length) {
      void Taro.showToast({
        title: '暂时没有消息',
        icon: 'none',
      });
    }
    return msg;
  }, [tab, commentMessage, supportMessage]);

  const fetchData = async () => {
    try {
      const res = await get(
        `/feed/events_list?last_time=${ctime}&direction=${'After'}&limit=${10}`
      );
      if (Array.isArray(res.data)) {
        setCtime(res.data.at(-1)?.ctime ?? 0);
      } else {
        setEnd(true);
      }
      const personalItems = async (items, itemType) => {
        return Promise.all(
          items.map(async (item) => {
            let detailRes, parentRes, user;
            if (itemType === 'Comment') {
              detailRes = await get(`/comments/${item.Ext.commentId}/detail`);
              parentRes = await get(
                `/comments/${detailRes.data?.parent_comment_id ?? 0}/detail`
              );
              user = await getUserInfo(item.Ext.commentator);
            } else if (itemType === 'Support') {
              detailRes =
                item.Ext.biz === 'Evaluation'
                  ? await get(`/evaluations/${item.Ext.bizId}/detail`)
                  : await get(`/answers/${item.Ext.bizId}/detail`);
              user = await getUserInfo(item.Ext.supporter);
            }

            return {
              username: user.nickname,
              avatar: user.avatar,
              eventType: itemType === 'Comment',
              description: itemType === 'Comment' && detailRes.data?.content,
              comment:
                itemType === 'Comment'
                  ? parentRes.data?.content
                  : detailRes.data?.content,
              timestamp: formatDate(item.Ctime as string),
            };
          })
        );
      };

      if (tab === '提问') {
        const comments = Array.isArray(res.data)
          ? res.data
              .filter((item) => item.type === 'Comment')
              .map((item) => JSON.parse(item.content))
          : [];
        setCommentMessage([
          ...commentMessage,
          ...(await personalItems(comments, 'Comment')),
        ]);
      } else if (tab === '点赞') {
        const supports = Array.isArray(res.data)
          ? res.data
              .filter((item) => item.type === 'Support')
              .map((item) => JSON.parse(item.content))
          : [];
        setSupportMessage([
          ...supportMessage,
          ...(await personalItems(supports, 'Support')),
        ]);
      } else {
        console.log('官方');
      }
      Taro.hideLoading();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const getParams = async () => {
      try {
        const res = (await postBool('/checkStatus', {
          name: 'kestack',
        })) as StatusResponse;
        setTest(res.data.status);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };
    void getParams();
  }, []);

  const handleScroll = useCallback(
    (event) => {
      if (end) {
        void Taro.showToast({
          title: '没有更多啦',
          icon: 'none',
        });
        return;
      }
      void Taro.showLoading({ title: '加载中 ...' });
      if (!loading) {
        void fetchData().then(() => {
          void Taro.hideLoading();
        });
      }
    },
    [loading, currentMessage.length, end]
  );

  useEffect(() => {
    void Taro.showLoading({
      title: '加载中',
    });
    setLoading(true);
    if (tab === '提问') {
      setCommentMessage(MOCK_COMMENT_MESSAGES as MessageType[]);
      setSupportMessage([]);
      setOfficialMessage([]);
    } else if (tab === '点赞') {
      setCommentMessage([]);
      setSupportMessage(MOCK_SUPPORT_MESSAGES as MessageType[]);
      setOfficialMessage([]);
    } else if (tab === '官方') {
      setCommentMessage([]);
      setSupportMessage([]);
      setOfficialMessage(MOCK_OFFICIAL_MESSAGES);
    }
    Taro.hideLoading();
    setLoading(false);
  }, [tab]);

  if (!test) {
    return (
      <View className="notification_fallback_container">
        <NavigationBar title="消息" isTabPage />
        <View className="fallback_list_container">
          {[
            {
              title: '如何使用课栈',
              content: '点击右下角的个人中心，即可查看课程信息',
              time: '2024-03-20',
            },
            {
              title: '遇到问题如何反馈？',
              content: '您可以通过设置页面的问题反馈向我们报告使用过程中遇到的问题',
              time: '2024-03-18',
            },
          ].map((item, index) => (
            <View key={index} className="fallback_item">
              <Text className="fallback_item_title">{item.title}</Text>
              <Text className="fallback_item_content">{item.content}</Text>
              <Text className="fallback_item_time">{item.time}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="notification_main_container">
      <NavigationBar title="消息" isTabPage />
      <TabBar
        tab={tab}
        //eslint-disable-next-line @typescript-eslint/no-shadow
        setTab={() => {}}
      />
      <VirtualList
        height="70%"
        width="100%"
        item={tab === '提问' || tab === '点赞' ? MessageItem : OfficialItem}
        itemData={currentMessage}
        itemCount={
          tab === '提问'
            ? commentMessage.length
            : tab === '点赞'
              ? supportMessage.length
              : 1
        }
        itemSize={tab === '提问' || tab === '点赞' ? 120 : 300}
        onScroll={handleScroll}
      />
    </View>
  );
});

export default Notification;
