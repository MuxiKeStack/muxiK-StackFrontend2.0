import Taro from '@tarojs/taro';
import React,{Component}from 'react';
import {Text,View,Image,Navigator} from '@tarojs/components'

//import * as echarts from 'echarts/core';

import * as echarts from '../ec-canvas/echarts' ;



export default class chart extends Component {
  render() {
    return (
      <View>
             <ec-canvas id='mychart-dom-bar' canvas-id='mychart-bar' ec={option}></ec-canvas>
        </View>
    )
  }
}

 /*constructor(props) {
    super(props)
    config = {
      usingComponents: {
        'ec-canvas': '../ec-canvas/ec-canvas'// 这里填写 ec-canvas 的路径
      }
    };
    this.state = {
      ec: {
        onInit: function (canvas, width, height) {
          const chart = echarts.init(canvas, null, {
            width: width,
            height: height
          });
          canvas.setChart(chart);
          const option =  {
            xAxis: {
              type: 'category',
              boundaryGap: false
            },
            yAxis: {
              type: 'value',
              boundaryGap: [0, '30%']
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
                  color: 'rgba(0, 0, 180, 0.4)'
                },
                {
                  gt: 5,
                  lt: 7,
                  color: 'rgba(0, 0, 180, 0.4)'
                }
              ]
            },
            series: [
              {
                type: 'line',
                smooth: 0.6,
                symbol: 'none',
                lineStyle: {
                  color: '#5470C6',
                  width: 5
                },
                markLine: {
                  symbol: ['none', 'none'],
                  label: { show: false },
                  data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }]
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
                  ['2019-10-18', 100]
                ]
              }
            ]
          };
          chart.setOption(option)
          return chart;

        }
      }
    }
  }*/

    /*const  option = {
        title: {
          text: 'Stacked Area Chart'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'Email',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: 'Union Ads',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [220, 182, 191, 234, 290, 330, 310]
          },
          {
            name: 'Video Ads',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [150, 232, 201, 154, 190, 330, 410]
          },
          {
            name: 'Direct',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [320, 332, 301, 334, 390, 330, 320]
          },
          {
            name: 'Search Engine',
            type: 'line',
            stack: 'Total',
            label: {
              show: true,
              position: 'top'
            },
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [820, 932, 901, 934, 1290, 1330, 1320]
          }
        ]
      };

  return (
        <View>
             <ec-canvas id='mychart-dom-bar' canvas-id='mychart-bar' ec={option}></ec-canvas>
        </View>
  )*/
