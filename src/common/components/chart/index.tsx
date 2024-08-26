/* eslint-disable */
import { Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { useCallback, useEffect, useState } from 'react';
import { Echarts } from 'taro-charts';

const { windowWidth } = Taro.getSystemInfoSync();
const E_HEIGHT = 300;
const E_WIDTH = windowWidth;

export default function Charts(props: { options: EChartsOption }) {
  //   useEffect(() => {
  //     setNavigationBarTitle({ title: '基础柱状图' });
  //   }, []);

  const option = {
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
        type: 'bar',
      },
    ],
  };
  const [chart, setChart] = useState<echarts.ECharts>();

  useEffect(() => {
    clickedCharts();
    return () => {
      if (process.env.TARO_ENV !== 'weapp') {
        chart?.dispose();
      }
    };
  }, [chart]);

  const clickedCharts = useCallback(() => {
    chart?.on('click', function (params) {
      console.log(params);
    });
  }, [chart]);

  return (
    <>
      <Canvas style={{ display: 'none' }} />
      <Echarts
        // 只有RN端需要指定RNRenderType的类型('skia'|'svg')
        // Please specify the RNRenderType('skia'|'svg'), when you use ReactNative
        onContextCreate={(canvas) => {
          const chart = echarts.init(canvas, 'light', {
            renderer: 'svg',
            devicePixelRatio: Taro.getSystemInfoSync().pixelRatio, // 可以解决小程序下图表模糊的问题
            width: E_WIDTH,
            height: E_HEIGHT,
          });
          canvas.setChart?.(chart);
          chart.setOption(option);
          setChart(chart);
        }}
      />
    </>
  );
}
