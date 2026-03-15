// mockQuestionData.ts

const mockQuestionList: WebQuestionVo[] = [
  {
    id: 1001,
    biz: 'Course',
    biz_id: 4571,
    content: '这门课期末考试难吗？老师会划重点吗？',
    questioner_id: 20101,
    ctime: 1741500000000, // 2024-03-09 10:00:00
    utime: 1741500000000,
    answer_cnt: 5,
    preview_answers: [],
  },
  {
    id: 1002,
    biz: 'Course',
    biz_id: 4571,
    content: '点名勤吗？能不能偶尔翘课？',
    questioner_id: 20102,
    ctime: 1741413600000, // 2024-03-08 10:00:00
    utime: 1741413600000,
    answer_cnt: 4,
    preview_answers: [
      {
        id: 5003,
        content: '每节课都点名！用的扫码签到，代签不了。翘课三次直接挂科，慎重啊！',
        publisher_id: 30103,
        question_id: 1002,
        ctime: 1741417200000,
        utime: 1741417200000,
      },
      {
        id: 5004,
        content: '确实，老师很看重出勤率，还会随机提问。建议每节课都去，课堂参与也占分。',
        publisher_id: 30104,
        question_id: 1002,
        ctime: 1741420800000,
        utime: 1741420800000,
      },
    ],
  },
  {
    id: 1003,
    biz: 'Course',
    biz_id: 4571,
    content: '小组作业怎么分组？可以自己组队吗？',
    questioner_id: 20103,
    ctime: 1741327200000, // 2024-03-07 10:00:00
    utime: 1741327200000,
    answer_cnt: 3,
    preview_answers: [
      {
        id: 5005,
        content:
          '可以自己组队，也可以等老师随机分。建议提前找好队友，随机分组可能遇到划水的。',
        publisher_id: 30105,
        question_id: 1003,
        ctime: 1741330800000,
        utime: 1741330800000,
      },
    ],
  },
  {
    id: 1004,
    biz: 'Course',
    biz_id: 4571,
    content: '教材需要买吗？用电子版行不行？',
    questioner_id: 20104,
    ctime: 1741240800000, // 2024-03-06 10:00:00
    utime: 1741240800000,
    answer_cnt: 6,
    preview_answers: [
      {
        id: 5006,
        content: '建议买二手教材，有些章节会布置课后题，电子版翻起来不方便。',
        publisher_id: 30106,
        question_id: 1004,
        ctime: 1741244400000,
        utime: 1741244400000,
      },
      {
        id: 5007,
        content: '我有电子版可以分享，但确实纸质版做笔记方便。看个人习惯吧。',
        publisher_id: 30107,
        question_id: 1004,
        ctime: 1741248000000,
        utime: 1741248000000,
      },
    ],
  },
  {
    id: 1005,
    biz: 'Course',
    biz_id: 4571,
    content: '给分怎么样？容易拿高分吗？',
    questioner_id: 20105,
    ctime: 1741154400000, // 2024-03-05 10:00:00
    utime: 1741154400000,
    answer_cnt: 7,
    preview_answers: [
      {
        id: 5008,
        content: '给分中等偏上，认真学90+没问题。期末占50%，平时作业30%，课堂参与20%。',
        publisher_id: 30108,
        question_id: 1005,
        ctime: 1741158000000,
        utime: 1741158000000,
      },
    ],
  },
  {
    id: 1006,
    biz: 'Course',
    biz_id: 4571,
    content: '实验课多吗？难不难？',
    questioner_id: 20106,
    ctime: 1741068000000, // 2024-03-04 10:00:00
    utime: 1741068000000,
    answer_cnt: 2,
    preview_answers: [
      {
        id: 5009,
        content: '实验课挺多的，每周一次，但都不难，跟着步骤做就行。',
        publisher_id: 30109,
        question_id: 1006,
        ctime: 1741071600000,
        utime: 1741071600000,
      },
      {
        id: 5010,
        content: '实验报告要认真写，占分不少。',
        publisher_id: 30110,
        question_id: 1006,
        ctime: 1741075200000,
        utime: 1741075200000,
      },
    ],
  },
];

const mockQuestionNum = mockQuestionList.length;

export { mockQuestionList, mockQuestionNum };
