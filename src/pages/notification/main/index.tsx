import { VirtualList } from '@/common/components';
import { TabItemProps } from '@/common/types/tabBarType';
import { NavigationBar } from '@/modules/navigation';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import TabBar from '../../../common/components/TabBar';
import { MessageItemProps } from '../type';
import { renderMessageItem } from './component/MessageItem';
import './index.scss';
import {
  MOCK_COMMENT_MESSAGES,
  MOCK_OFFICIAL_MESSAGES,
  MOCK_SUPPORT_MESSAGES,
} from './mock';

const Notification: React.FC = memo(() => {
  const [commentMessage, setCommentMessage] = useState<MessageItemProps[]>([]);
  const [supportMessage, setSupportMessage] = useState<MessageItemProps[]>([]);
  const [officialMessage, setOfficialMessage] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useCallback((url: string) => void Taro.navigateTo({ url }), []);

  const TABS: TabItemProps[] = [
    {
      name: '评论',
      icon: 'tiwen',
      key: 'comment',
    },
    {
      name: '点赞',
      icon: 'like',
      key: 'support',
    },
    {
      name: '官方',
      icon: 'guanfangbanben',
      key: 'official',
    },
  ];

  const currentMessage = useMemo(() => {
    const msg = [...commentMessage, ...supportMessage, ...officialMessage];
    if (!msg || !msg.length) {
      void Taro.showToast({
        title: '暂时没有消息',
        icon: 'none',
      });
    }
    return msg;
  }, [officialMessage, commentMessage, supportMessage]);

  // const fetchData = async () => {
  //   try {
  //     const res = await get(
  //       `/feed/events_list?last_time=${ctime}&direction=${'After'}&limit=${10}`
  //     );
  //     if (Array.isArray(res.data)) {
  //       setCtime(res.data.at(-1)?.ctime ?? 0);
  //     } else {
  //       setEnd(true);
  //     }
  //     const personalItems = async (items, itemType) => {
  //       return Promise.all(
  //         items.map(async (item) => {
  //           let detailRes, parentRes, user;
  //           if (itemType === 'Comment') {
  //             detailRes = await get(`/comments/${item.Ext.commentId}/detail`);
  //             parentRes = await get(
  //               `/comments/${detailRes.data?.parent_comment_id ?? 0}/detail`
  //             );
  //             user = await getUserInfo(item.Ext.commentator);
  //           } else if (itemType === 'Support') {
  //             detailRes =
  //               item.Ext.biz === 'Evaluation'
  //                 ? await get(`/evaluations/${item.Ext.bizId}/detail`)
  //                 : await get(`/answers/${item.Ext.bizId}/detail`);
  //             user = await getUserInfo(item.Ext.supporter);
  //           }

  //           return {
  //             username: user.nickname,
  //             avatar: user.avatar,
  //             eventType: itemType === 'Comment',
  //             description: itemType === 'Comment' && detailRes.data?.content,
  //             comment:
  //               itemType === 'Comment'
  //                 ? parentRes.data?.content
  //                 : detailRes.data?.content,
  //             timestamp: formatIsoDate(item.Ctime as string),
  //           };
  //         })
  //       );
  //     };

  //     if (tab === '提问') {
  //       const comments = Array.isArray(res.data)
  //         ? res.data
  //             .filter((item) => item.type === 'Comment')
  //             .map((item) => JSON.parse(item.content))
  //         : [];
  //       setCommentMessage([
  //         ...commentMessage,
  //         ...(await personalItems(comments, 'Comment')),
  //       ]);
  //     } else if (tab === '点赞') {
  //       const supports = Array.isArray(res.data)
  //         ? res.data
  //             .filter((item) => item.type === 'Support')
  //             .map((item) => JSON.parse(item.content))
  //         : [];
  //       setSupportMessage([
  //         ...supportMessage,
  //         ...(await personalItems(supports, 'Support')),
  //       ]);
  //     } else {
  //       console.log('官方');
  //     }
  //     Taro.hideLoading();
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  // useEffect(() => {
  //   const getParams = async () => {
  //     try {
  //       const res = (await postBool('/checkStatus', {
  //         name: 'kestack',
  //       })) as StatusResponse;
  //       setTest(res.data.status);
  //     } catch (error) {
  //       console.error('Error fetching status:', error);
  //     }
  //   };
  //   void getParams();
  // }, []);

  // const handleScroll = useCallback(
  //   (event) => {
  //     if (end) {
  //       void Taro.showToast({
  //         title: '没有更多啦',
  //         icon: 'none',
  //       });
  //       return;
  //     }
  //     void Taro.showLoading({ title: '加载中 ...' });
  //     if (!loading) {
  //       void fetchData().then(() => {
  //         void Taro.hideLoading();
  //       });
  //     }
  //   },
  //   [loading, currentMessage.length, end]
  // );

  useEffect(() => {
    void Taro.showLoading({
      title: '加载中',
    });
    setLoading(true);
    setCommentMessage(MOCK_COMMENT_MESSAGES as MessageItemProps[]);
    setSupportMessage(MOCK_SUPPORT_MESSAGES as MessageItemProps[]);
    setOfficialMessage(MOCK_OFFICIAL_MESSAGES as MessageItemProps[]);
    Taro.hideLoading();
    setLoading(false);
  });

  // if (!test) {
  //   return (
  //     <View className="notification_fallback_container">
  //       <NavigationBar title="消息" isTabPage />
  //       <View className="fallback_list_container">
  //         {[
  //           {
  //             title: '如何使用课栈',
  //             content: '点击右下角的个人中心，即可查看课程信息',
  //             time: '2024-03-20',
  //           },
  //           {
  //             title: '遇到问题如何反馈？',
  //             content: '您可以通过设置页面的问题反馈向我们报告使用过程中遇到的问题',
  //             time: '2024-03-18',
  //           },
  //         ].map((item, index) => (
  //           <View key={index} className="fallback_item">
  //             <Text className="fallback_item_title">{item.title}</Text>
  //             <Text className="fallback_item_content">{item.content}</Text>
  //             <Text className="fallback_item_time">{item.time}</Text>
  //           </View>
  //         ))}
  //       </View>
  //     </View>
  //   );
  // }

  const handleTabClick = async (key: string) => {
    try {
      let data: MessageItemProps[] = [];

      switch (key) {
        case 'comment':
          data = commentMessage;
          break;
        case 'support':
          data = supportMessage;
          break;
        case 'official':
          data = officialMessage;
          break;
      }

      const encodedData = encodeURIComponent(JSON.stringify(data));
      navigate(`/pages/notification/list/index?data=${encodedData}&type=${key}`);
    } catch (err) {
      console.error('跳转失败:', err);
    }
  };

  return (
    <View className="notification_main_container">
      <NavigationBar title="消息" isTabPage />
      <TabBar
        //eslint-disable-next-line @typescript-eslint/no-shadow
        tabs={TABS}
        onTabClick={handleTabClick}
      />
      <VirtualList
        height="70%"
        width="100%"
        item={renderMessageItem}
        itemData={currentMessage}
        itemCount={currentMessage.length}
        itemSize={200}
        onScroll={() => {}}
      />
    </View>
  );
});

export default Notification;
