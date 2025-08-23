import { Canvas, Image, View } from '@tarojs/components';
import Taro, { CanvasContext } from '@tarojs/taro';
import React, { CSSProperties, useEffect, useMemo } from 'react';

import {
  drawBottomInfo,
  drawCoordinateDiagram,
  drawHightlightScore,
  drawRoundedRectangle,
} from './utils';

interface LineChartProps {
  data?: number[];
  style?: CSSProperties;
  className?: string;
  /** x轴标签 */
  xLabels?: string[];
  /** y轴标签 */
  yLabels?: string[];
  /** 与x轴标签对应的范围 */
  xRange?: [number, number][];
  /** x、y、data之间的映射函数 */
  mappingFunction?: (data: number[], x: [number, number]) => number;
  /** 边距： 左右上下 */
  padding?: number[];
  /** 最大分、最小分、平均分 */
  maxScore?: number;
  minScore?: number;
  avgScore?: number;
  /** 容器id，默认为lineCanvas */
  id?: string;
  /** 标题 */
  title?: string;
  /** 画布宽高 */
  width?: number;
  height?: number;
  /** 底部内容高度 */
  bottomHeight?: number;
}
const DEFAULT_HIGHLIGHT_COLOR = '#FFA500';
const DEFAULT_AXIS_TEXT_COLOR = '#3D3D3D';
const DEFAULT_LINE_COLOR = '#F48500';
const DEFAULT_Axis_LINE_COLOR = '#3D3D3D';
const DEFAULT_PADDING = [25, 45, 35, 35]; //左右上下
const DEFAULT_WIDTH = Taro.getSystemInfoSync().screenWidth * 0.9;
const DEFAULT_HEIGHT = 260;
const DEFAULT_BOTTOM_HEIGTH = 40;
const DEFAULT_DATA = [10, 20, 30, 40, 50, 60, 70];
const DEFAULT_X_LABELS = ['0', '60', '70', '80', '90', '100'];
const DEFUALT_Y_LABELS = ['0%', '20%', '40%', '60%', '80%', '100%'];
const DEFAUTL_X_RANGE: [number, number][] = [
  [0, 0],
  [1, 59],
  [60, 69],
  [70, 79],
  [80, 89],
  [90, 100],
];
const DEFAULT_MAPPING_FUNCTION = (
  data: number[],
  x: [number, number],
  height: number,
  y: number
) => {
  const sum = data.length;
  let cnt = 0;
  data.forEach((d) => {
    if (d >= x[0] && d <= x[1]) cnt++;
  });
  const ratio = cnt / sum;
  return y - ratio * height;
};
const DEFAULT_CHART_ID = 'lineCanvas';
const DEFAULT_GAP_LINE_COLOR = '#FE9F00';

const LineChart: React.FC<LineChartProps> = (props) => {
  const {
    width: propWidth,
    height: propHeight,
    bottomHeight: propBHeight,
    maxScore = 0,
    minScore = 0,
    avgScore = 0,
    id,
    data: propData,
    className,
    padding: propPadding,
    xLabels: propX,
    yLabels: propY,
    xRange: propXRange,
    mappingFunction: propMFunc,
    style,
  } = props;
  useEffect(() => {
    if (propData) {
      const ctx = Taro.createCanvasContext(id ?? DEFAULT_CHART_ID);
      void drawChart(ctx);
    }
  }, [propData]);
  const hasData = useMemo(() => {
    return !propData?.some((data) => data);
  }, [propData]);
  const drawChart = (ctx: CanvasContext) => {
    // 初始化
    const data = propData ?? DEFAULT_DATA;
    const width = propWidth ?? DEFAULT_WIDTH;
    const height = propHeight ?? DEFAULT_HEIGHT;
    const bottomHeight = propBHeight ?? DEFAULT_BOTTOM_HEIGTH;
    const [pl, pr, pt, pb] = propPadding ?? DEFAULT_PADDING;
    const xLabels = propX ?? DEFAULT_X_LABELS;
    const yLabels = propY ?? DEFUALT_Y_LABELS;
    const xRange = propXRange ?? DEFAUTL_X_RANGE;
    const mappingFunction = propMFunc ?? DEFAULT_MAPPING_FUNCTION;
    ctx.clearRect(0, 0, width, height);
    // // 适配不同比例
    // if (width / height > 2) {
    //   ctx.scale((height * 2) / width, 1);
    // } else {
    //   ctx.scale(1, width / 2 / height);
    // }
    // const barWidth = (width - 2 * padding) / data.length;
    // const lines = 5;

    //绘制背景
    drawRoundedRectangle(
      ctx,
      0,
      0,
      width,
      height,
      [10, 10, 10, 10],
      () => null,
      '#FEF8E4'
    );

    //绘制坐标图
    drawCoordinateDiagram(
      ctx,
      data,
      [pl, height - pb - bottomHeight],
      [true, false],
      [height - pb - bottomHeight + 15, width - pr + 8],
      width - pl - pr,
      height - pt - pb - bottomHeight,
      xLabels,
      yLabels,
      xRange,
      mappingFunction,
      DEFAULT_Axis_LINE_COLOR,
      DEFAULT_GAP_LINE_COLOR,
      DEFAULT_AXIS_TEXT_COLOR,
      DEFAULT_LINE_COLOR
    );

    drawBottomInfo(
      ctx,
      avgScore,
      minScore,
      maxScore,
      [pl, height - Math.floor(bottomHeight / 2)],
      width - pl
    );

    //高亮平均值
    const avgXValue = avgScore;
    const avgXPos = (() => {
      // 找到avgXValue的区间
      let rangeIdx = -1;
      let rangeLength = -1;
      let property = -1;
      for (let i = 0; i < xRange.length; i++) {
        const [min, max] = xRange[i];
        if (avgXValue >= min && avgXValue <= max) {
          rangeIdx = i;
          rangeLength = Math.max(max - min, 1);
          property = avgXValue - min;
          break;
        }
      }

      if (rangeIdx === -1) return -1; // 不在任何区间，直接不画

      // 计算该区间对应的 x 像素位置
      const chartWidth = width - pl - pr;
      const singleWidth = Math.floor(chartWidth / (xLabels.length - 1));
      //注意[0，0]区间不占长度，所以要-1
      const posX =
        pl + (rangeIdx - 1) * singleWidth + singleWidth * (property / rangeLength);
      return posX;
    })();
    if (avgXPos !== -1)
      drawHightlightScore(
        ctx,
        [avgXPos, height - pb - bottomHeight],
        pl,
        height - pb - pt - bottomHeight,
        10,
        `${avgScore.toFixed(2)}`,
        DEFAULT_HIGHLIGHT_COLOR,
        (gradient: Taro.CanvasGradient) => {
          gradient.addColorStop(0, DEFAULT_HIGHLIGHT_COLOR); // 顶部不透明橙色
          gradient.addColorStop(1, 'rgba(255, 165, 0, 0)'); // 底部完全透明
        }
      );

    void ctx.draw();
  };

  return (
    <View
      className={className}
      style={{
        ...style,
        ...{
          width: `${propWidth ?? DEFAULT_WIDTH}px`,
          height: `${propHeight ?? DEFAULT_HEIGHT}px`,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          position: 'relative',
        },
      }}
    >
      {hasData && <View>数据量太少,暂不支持预览</View>}
      {hasData ? (
        <Image
          src="https://s2.loli.net/2024/12/11/sJ9kANj5yz6HiUa.png"
          style={{
            width: `${propWidth ?? DEFAULT_WIDTH}px`,
            height: `${propHeight ?? DEFAULT_HEIGHT}px`,
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />
      ) : (
        <Canvas
          id={id ?? DEFAULT_CHART_ID}
          canvasId={id ?? DEFAULT_CHART_ID}
          className={className}
          style={{
            ...style,
            ...{
              width: `${propWidth ?? DEFAULT_WIDTH}px`,
              height: `${propHeight ?? DEFAULT_HEIGHT}px`,
              flex: 1,
            },
          }}
        />
      )}
    </View>
  );
};

export default LineChart;
