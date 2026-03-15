import { MessageItemProps } from '../type';

// 模拟用户头像URL（使用占位图）
const AVATARS = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/67.jpg',
  'https://randomuser.me/api/portraits/women/23.jpg',
  'https://randomuser.me/api/portraits/men/81.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/men/91.jpg',
  'https://randomuser.me/api/portraits/women/72.jpg',
];

// 模拟课程/内容相关文本
const COURSE_NAMES = [
  '数据结构与算法',
  '计算机组成原理',
  '操作系统',
  '计算机网络',
  '数据库系统',
  '软件工程',
  '人工智能导论',
  '机器学习基础',
  'Web前端开发',
  '移动应用开发',
];

const COMMENT_TEXTS = [
  '老师讲得非常清晰，我一下就理解了二叉树的遍历原理。',
  '这个知识点我在其他地方一直没搞懂，看了这节课终于明白了。',
  '有没有同学一起讨论一下动态规划的解题思路？',
  '课后的练习题很有挑战性，做完收获很大。',
  '教学视频的声音有点小，建议调大一些。',
  '课程资料非常全面，感谢老师的整理和分享。',
  '这个编程作业有点难度，需要花点时间研究。',
  '小组合作项目体验很好，学到了团队协作的技巧。',
  '希望能增加一些实际案例的讲解。',
  '考试的重点很明确，复习起来有方向。',
];

const REPLY_TEXTS = [
  '同意你的看法，我也觉得这部分讲得很好。',
  '我可以分享一下我的解题思路，希望对你有帮助。',
  '我们一起讨论吧，我也对这个话题感兴趣。',
  '感谢提醒，我会向老师反馈音频问题。',
  '是的，资料整理得很有条理，复习起来很方便。',
  '如果有不懂的地方可以随时问我。',
  '实践确实很重要，理论结合实践效果更好。',
  '团队协作中沟通确实很关键。',
  '这个建议很好，我会记录下来。',
  '考试加油，祝你取得好成绩！',
];

const USERNAMES = [
  '张明',
  '李华',
  '王芳',
  '刘伟',
  '陈静',
  '杨阳',
  '赵敏',
  '周杰',
  '吴娜',
  '郑浩',
  '孙悦',
  '朱强',
  '马超',
  '胡月',
  '林峰',
];

// 模拟图片URL（用于测试images字段）
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w-400',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400',
];

// 生成随机消息数据
export const generateMockMessages = (count: number = 20) => {
  const messages: MessageItemProps[] = [];

  for (let i = 0; i < count; i++) {
    const isComment = Math.random() > 0.5; // 50%概率是评论，50%是点赞
    const randomUserIndex = Math.floor(Math.random() * USERNAMES.length);
    const hasImages = Math.random() > 0.7; // 30%的概率有图片
    const type = isComment ? 'comment' : 'support';

    const message: MessageItemProps = {
      userName: USERNAMES[randomUserIndex],
      avatar: AVATARS[randomUserIndex % AVATARS.length],
      type: type,
      timeStamp: generateRandomTime(),
      ctime: Date.now() - Math.floor(Math.random() * 100000000),
      title: `关于${COURSE_NAMES[Math.floor(Math.random() * COURSE_NAMES.length)]}的通知`,
    };

    if (type === 'comment') {
      // 评论类型
      message.reply = REPLY_TEXTS[Math.floor(Math.random() * REPLY_TEXTS.length)];
      message.originalComment =
        COMMENT_TEXTS[Math.floor(Math.random() * COMMENT_TEXTS.length)];
    } else if (type === 'support') {
      // 点赞类型
      message.description = `赞了你在课程《${COURSE_NAMES[Math.floor(Math.random() * COURSE_NAMES.length)]}》中的评论`;
    }

    // 给部分消息添加图片
    if (hasImages) {
      const imageCount = Math.floor(Math.random() * 3) + 1; // 1-3张图片
      message.images = [];
      for (let j = 0; j < imageCount; j++) {
        message.images.push(
          SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]
        );
      }
    }

    messages.push(message);
  }

  return messages;
};

// 预生成的硬编码数据（可以直接使用）
export const MOCK_COMMENT_MESSAGES = [
  {
    type: 'comment',
    title: '算法讨论',
    teacher: '张教授',
    composite_score: 4.5,
    courseType: '专业选修课',
    userName: '李华',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    reply: '我也有类似的疑问，求解答',
    originalComment: '关于动态规划的状态转移方程不太理解',
    timeStamp: '03-24 10:15',
    ctime: 1711253700000,
  },
  {
    type: 'comment',
    title: '排序算法比较',
    teacher: '王老师',
    composite_score: 4.2,
    courseType: '专业主干课',
    userName: '刘伟',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    reply: '我觉得可以从时间复杂度分析入手',
    originalComment: '快速排序和归并排序哪个在实际应用中更优？',
    timeStamp: '03-22 09:20',
    ctime: 1711070400000,
    images: ['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400'],
  },
  {
    type: 'comment',
    title: '递归算法优化',
    teacher: '李教授',
    composite_score: 4.8,
    courseType: '专业主干课',
    userName: '杨阳',
    avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
    reply: '感谢分享，这个方法很实用',
    originalComment: '如何优化递归算法的空间复杂度？',
    timeStamp: '03-20 11:05',
    ctime: 1710896700000,
  },
  {
    type: 'comment',
    title: '数据库优化讨论',
    teacher: '陈老师',
    composite_score: 4.0,
    courseType: '专业选修课',
    userName: '赵敏',
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
    reply: '我也遇到了同样的问题',
    originalComment: '数据库连接池配置的最佳实践是什么？',
    timeStamp: '03-19 15:40',
    ctime: 1710834000000,
    images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400'],
  },
  {
    type: 'comment',
    title: ',数据结构与算法，我的刀盾，巴巴博弈，巴嘎雅鹿，别逼别逼，外币八部',
    teacher: '王教授',
    composite_score: 4.6,
    courseType: '专业主干课',
    userName: '张明',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    reply: '这个解释很清晰，我一下就明白了！',
    originalComment:
      '请问二叉树的前序遍历具体是怎么实现的？请问二叉树的前序遍历具体是怎么实现的？请问二叉树的前序遍历具体是怎么实现的？',
    timeStamp: '03-25 14:30',
    ctime: 1711348200000,
    images: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
    ],
  },
  {
    type: 'comment',
    title: ',数据结构与算法，我的刀盾，巴巴博弈，巴嘎雅鹿，别逼别逼，外币八部',
    teacher: '王教授',
    composite_score: 4.6,
    courseType: '专业主干课',
    userName: '张明',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    reply: '这个解释很清晰，我一下就明白了！',
    originalComment:
      '请问二叉树的前序遍历具体是怎么实现的？请问二叉树的前序遍历具体是怎么实现的？请问二叉树的前序遍历具体是怎么实现的？',
    timeStamp: '03-25 14:30',
    ctime: 1711348200000,
    images: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
    ],
  },
  {
    type: 'comment',
    title: ',数据结构与算法，我的刀盾，巴巴博弈，巴嘎雅鹿，别逼别逼，外币八部',
    teacher: '王教授',
    composite_score: 4.6,
    courseType: '专业主干课',
    userName: '张明',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    reply: '这个解释很清晰，我一下就明白了！',
    originalComment:
      '请问二叉树的前序遍历具体是怎么实现的？请问二叉树的前序遍历具体是怎么实现的？请问二叉树的前序遍历具体是怎么实现的？',
    timeStamp: '03-25 14:30',
    ctime: 1711348200000,
    images: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
    ],
  },
  {
    type: 'comment',
    title: ',数据结构与算法，我的刀盾，巴巴博弈，巴嘎雅鹿，别逼别逼，外币八部',
    teacher: '王教授',
    composite_score: 4.6,
    courseType: '专业主干课',
    userName: '张明',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    reply: '这个解释很清晰，我一下就明白了！',
    originalComment:
      '请问二叉树的前序遍历具体是怎么实现的？请问二叉树的前序遍历具体是怎么实现的？请问二叉树的前序遍历具体是怎么实现的？',
    timeStamp: '03-25 14:30',
    ctime: 1711348200000,
    images: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
    ],
  },
];

export const MOCK_SUPPORT_MESSAGES: MessageItemProps[] = [
  {
    userName: '王芳',
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    type: 'support',
    description: '赞了你的评论',
    timeStamp: '03-23 16:45',
    originalComment: '关于动态规划的状态转移方程不太理解',
    ctime: 1711169100000,
    title: '课程点赞通知',
  },
  {
    userName: '陈静',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    type: 'support',
    description: '赞了你的回答',
    originalComment: '关于动态规划的状态转移方程不太理解',
    timeStamp: '03-21 19:10',
    ctime: 1710983400000,
    title: '操作系统课程互动',
    images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w-400'],
  },
  {
    title: '排序算法比较',
    userName: '周杰',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    type: 'support',
    description:
      '赞了你的评论关于动态规划的状态转移方程不太理解关于动态规划的状态转移方程不太理解关于动态规划的状态转移方程不太理解关于动态规划的状态转移方程不太理解',
    originalComment:
      '关于动态规划的状态转移方程不太理解关于动态规划的状态转移方程不太理解关于动态规划的状态转移方程不太理解关于动态规划的状态转移方程不太理解',
    timeStamp: '03-18 08:55',
    ctime: 1710723300000,
  },
  {
    userName: '吴娜',
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    type: 'support',
    description: '赞了你的项目分享',
    originalComment: '关于动态规划的状态转移方程不太理解',
    timeStamp: '03-25 13:20',
    ctime: 1711344000000,
    title: '前端项目点赞',
    images: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400',
    ],
  },
  {
    title: '排序算法比较',
    userName: '郑浩',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    originalComment: '关于动态规划的状态转移方程不太理解',
    type: 'support',
    description: '赞了你的学习笔记',
    timeStamp: '03-24 17:30',
    ctime: 1711272600000,
  },
  {
    userName: '孙悦',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    type: 'support',
    description: '赞了你的小组讨论',
    originalComment: '关于动态规划的状态转移方程不太理解',
    timeStamp: '03-23 20:15',
    ctime: 1711191300000,
    title: '小组讨论互动',
  },
  {
    title: '排序算法比较',
    userName: '朱强',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    type: 'support',
    description: '赞了你的代码示例',
    originalComment: '关于动态规划的状态转移方程不太理解',
    timeStamp: '03-22 14:45',
    ctime: 1711089900000,
    images: ['https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400'],
  },
  {
    userName: '马超',
    avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
    type: 'support',
    description: '赞了你的问题思考',
    originalComment: '关于动态规划的状态转移方程不太理解',
    timeStamp: '03-21 11:10',
    ctime: 1710971400000,
    title: 'AI课程互动',
  },
];

// 官方通知数据
export const MOCK_OFFICIAL_MESSAGES: MessageItemProps[] = [
  {
    userName: '系统通知',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    type: 'official',
    description:
      '课程讨论区已支持图片上传和代码高亮功能,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙',
    timeStamp: '03-22',
    ctime: 1711065600000,
    title: '新功能上线afjkajfkafjlkasjdfajflafjklakfjas;fjakfj;ajkafjaldk',
  },
  {
    userName: '系统通知',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    type: 'official',
    description:
      '课程讨论区已支持图片上传和代码高亮功能,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙,宝宝你是一条香香软软的天救龙',
    timeStamp: '03-22',
    ctime: 1710892800000,
    title: '学习提醒',
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w-400',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
    ],
  },
  {
    title: '系统通知系统通知系统通知',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    type: 'official',
    description: '本系统将于本周五晚上10点至周六早上6点进行维护升级',
    timeStamp: '03-25',
    ctime: Date.now() - 20 * 60 * 1000,
    userName: '系统维护通知',
    images: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400'],
  },
  {
    userName: '系统通知系统通知',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    type: 'official',
    description: '本系统将于本周五晚上10点至周六早上6点进行维护升级',
    timeStamp: '03-25',
    ctime: Date.now() - 20 * 60 * 1000,
    title: '系统维护通知',
    images: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400'],
  },
  {
    userName: '系统通知系统通知系统通知系统通知系统通知系统通知',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    type: 'official',
    description: '本系统将于本周五晚上10点至周六早上6点进行维护升级',
    timeStamp: '03-25',
    ctime: Date.now() - 20 * 60 * 1000,
    title: '系统维护通知',
    images: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400'],
  },
  {
    userName: '系统通知系统通知系统通知系统通知系统通知',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    type: 'official',
    description: '本系统将于本周五晚上10点至周六早上6点进行维护升级',
    timeStamp: '03-25',
    ctime: Date.now() - 20 * 60 * 1000,
    title: '系统维护通知',
    images: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400'],
  },
  {
    userName: '系统通知系统通知系统通知系统通知',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    type: 'official',
    description: '本系统将于本周五晚上10点至周六早上6点进行维护升级',
    timeStamp: '03-25',
    ctime: Date.now() - 20 * 60 * 1000,
    title:
      'adsfjkljfkaljdfjafdjajdfalkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk;;;;;;;;;;;;;afjaklfjalkfjajfkajfklajfal',
    images: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400'],
  },
  {
    title:
      '系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知系统通知',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    type: 'official',
    description:
      '您在高等数学下方的评课内容违规（疑似恶意低分/无关评价，请注意您的发言！',
    timeStamp: '2024-03-25 12:20',
    ctime: Date.now(),
    userName: '违规提醒',
  },
];
