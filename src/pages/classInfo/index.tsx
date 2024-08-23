import { Text, View } from '@tarojs/components';
import { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Echarts, { EChartOption, EchartsHandle } from 'taro-react-echarts';

import './index.scss';

// eslint-disable-next-line import/first
import Comment from '@/components/comment/comment';
// eslint-disable-next-line import/first
import Label3 from '@/components/label3/label3';
// eslint-disable-next-line import/first
import ShowStar from '@/components/showStar/showStar';

// import echarts from '../../assets/js/echarts.js'
// eslint-disable-next-line import/first
import { get } from '@/fetch';

import echarts from '../../assets/js/echarts';

// 定义接口
interface Course {
  id: number;
  name: string;
  teacher: string;
  school: string;
  type: string;
  credit: number;
  composite_score: number;
  rater_count: number;
  assessments: Record<string, any>; // 使用 Record 类型来表示对象，具体类型根据实际结构定义
  features: Record<string, any>;
  is_collected: boolean;
  is_subscribed: boolean;
}

function Chart() {
  const echartsRef = useRef<EchartsHandle>(null);
  const option: EChartOption = {
    legend: {
      top: 50,
      left: 'center',
      z: 100,
    },
    tooltip: {
      trigger: 'axis',
      show: true,
      confine: true,
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line',
      },
    ],
  };

  return <Echarts echarts={echarts} option={option} ref={echartsRef} />;
}

// class Chart extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       ec: {
//         onInit: function (canvas, width, height) {
//           const chart = echarts.init(canvas, null, {
//             width: width,
//             height: height,
//           });
//           canvas.setChart(chart);
//           const option = {
//             xAxis: {
//               type: 'category',
//               boundaryGap: false,
//             },
//             yAxis: {
//               type: 'value',
//               boundaryGap: [0, '30%'],
//             },
//             visualMap: {
//               type: 'piecewise',
//               show: false,
//               dimension: 0,
//               seriesIndex: 0,
//               pieces: [
//                 {
//                   gt: 1,
//                   lt: 3,
//                   color: 'rgba(0, 0, 180, 0.4)',
//                 },
//                 {
//                   gt: 5,
//                   lt: 7,
//                   color: 'rgba(0, 0, 180, 0.4)',
//                 },
//               ],
//             },
//             series: [
//               {
//                 type: 'line',
//                 smooth: 0.6,
//                 symbol: 'none',
//                 lineStyle: {
//                   color: '#5470C6',
//                   width: 5,
//                 },
//                 markLine: {
//                   symbol: ['none', 'none'],
//                   label: { show: false },
//                   data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }],
//                 },
//                 areaStyle: {},
//                 data: [
//                   ['2019-10-10', 200],
//                   ['2019-10-11', 560],
//                   ['2019-10-12', 750],
//                   ['2019-10-13', 580],
//                   ['2019-10-14', 250],
//                   ['2019-10-15', 300],
//                   ['2019-10-16', 450],
//                   ['2019-10-17', 300],
//                   ['2019-10-18', 100],
//                 ],
//               },
//             ],
//           };
//           chart.setOption(option);
//           return chart;
//         },
//       },
//     };
//   }
//   render() {
//     return (
//       <View className="canvas-container">
//         <ec-canvas
//           id="mychart-dom-bar"
//           canvas-id="mychart-bar"
//           ec={this.state.ec}
//         ></ec-canvas>
//       </View>
//     );
//   }
// }

export default function index(){
  const commentNumber = 2;

  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const getCourseData = async () => {
      try {
        get(`/courses/1/detail`, true).then((res) => {
          console.log(res);
          setCourse(res.data);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    getCourseData();
  }, []); // 空依赖数组确保仅在组件挂载时执行

  const commentExample = {
    username: '昵称',
    score: 3.5,
    isHot: false,
    date: '2023.7.13',
    time: '16:30',
    content:
      '评价斤斤计较斤斤计较急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急cfadsutfc7acga促使第一次给有多个素材u辛苦参赛的他u发出委托方徐v阿托伐窜同时1蓄西安粗体为擦u逃窜他敦促台湾的垡等下颚骨我发帖都要',
    like: 123,
    comment: 123,
    dislike: 123,
  };

  if (!course) {
    return <Text>Loading...</Text>; // 数据加载中
  }

  return (
    <View className="classInfo">
      <View className="theClassnme">{course?.name}</View>
      <View className="teacherName">
        {course.school} {course.teacher}
      </View>
      <View className="p">
        综合评分: <ShowStar score={course.composite_score} />
        <Text>（共{course.rater_count}人评价）</Text>
      </View>
      <View className="p">
        课程分类: <Label3 content={course.type} />
      </View>
      <View className="p">
        课程特点:{' '}
        {course.features.map((feature) => (
          <Label3 content={feature}></Label3>
        ))}
      </View>
      <Chart></Chart>
      <Comment {...commentExample} />
    </View>
  );
}
