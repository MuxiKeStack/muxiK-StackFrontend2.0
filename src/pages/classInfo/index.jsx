import { Text, View } from '@tarojs/components';
import { Component } from 'react';

import './index.scss';

// eslint-disable-next-line import/first
import Comment from '@/components/comment/comment';
// eslint-disable-next-line import/first
import Label3 from '@/components/label3/label3';
// eslint-disable-next-line import/first
import ShowStar from '@/components/showStar/showStar';

//import Chart from '@/components/chart/chart'
//@ts-ignore
import * as echarts from '../../components/ec-canvas/echarts.js'; // 引入echarts

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ec: {
        onInit: function (canvas, width, height) {
          const chart = echarts.init(canvas, null, {
            width: width,
            height: height,
          });
          canvas.setChart(chart);
          const option = {
            xAxis: {
              type: 'category',
              boundaryGap: false,
            },
            yAxis: {
              type: 'value',
              boundaryGap: [0, '30%'],
            },
            visualMap: {
              type: 'piecewise',
              show: false,
              dimension: 0,
              seriesIndex: 0,
              pieces: [
                {
                  gt: 1,
                  lt: 3,
                  color: 'rgba(0, 0, 180, 0.4)',
                },
                {
                  gt: 5,
                  lt: 7,
                  color: 'rgba(0, 0, 180, 0.4)',
                },
              ],
            },
            series: [
              {
                type: 'line',
                smooth: 0.6,
                symbol: 'none',
                lineStyle: {
                  color: '#5470C6',
                  width: 5,
                },
                markLine: {
                  symbol: ['none', 'none'],
                  label: { show: false },
                  data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }],
                },
                areaStyle: {},
                data: [
                  ['2019-10-10', 200],
                  ['2019-10-11', 560],
                  ['2019-10-12', 750],
                  ['2019-10-13', 580],
                  ['2019-10-14', 250],
                  ['2019-10-15', 300],
                  ['2019-10-16', 450],
                  ['2019-10-17', 300],
                  ['2019-10-18', 100],
                ],
              },
            ],
          };
          chart.setOption(option);
          return chart;
        },
      },
    };
  }
  render() {
    return (
      <View className="canvas-container">
        <ec-canvas
          id="mychart-dom-bar"
          canvas-id="mychart-bar"
          ec={this.state.ec}
        ></ec-canvas>
      </View>
    );
  }
}

export default function index() {
  const theClassnme = '互联网产品交互设计稿';

  const teacherCollege = '心理学院';

  const teacherName = '高闯';

  const score = 3.5;

  const commentNumber = 2;

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

  return (
    <View className="classInfo">
      <View className="theClassnme">{theClassnme}</View>
      <View className="teacherName">
        {teacherCollege} {teacherName}
      </View>
      <View className="p">
        综合评分: <ShowStar score={score} />
        <Text>（共{commentNumber}人评价）</Text>
      </View>
      <View className="p">
        课程分类: <Label3 content="通识选修课" />
      </View>
      <View className="p">
        课程特点: <Label3 content="老师风趣幽默" /> <Label3 content="课程内容干货多" />
      </View>
      <Chart></Chart>
      <Comment {...commentExample} />
    </View>
  );
}
