/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Canvas } from '@tarojs/components';
import Taro, { CanvasContext, Canvas as CanvasInterface } from '@tarojs/taro';
import React, { CSSProperties, useEffect } from 'react';

interface LineChartProps {
  data: number[];
  /** x轴标签 */
  xLabels?: string[];
  /** 边距 */
  padding?: number;
  style: CSSProperties;
  /** 线条颜色 */
  lineColor?: string;
  /** 点颜色 */
  dotColor?: string;
  className?: string;
  /** 容器id，默认为lineCanvas */
  id?: string;
  /** 画布宽高 */
  width?: number;
  height?: number;
}
const DEFAULT_DOT_COLOR = '#0ff';
const DEFAULT_TEXT_COLOR = '#000';
const DEFAULT_LINE_COLOR = '#0ff';
const DEFAULT_PADDING = 30;
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 150;
const DEFAULT_DATA = [10, 20, 30, 40, 50, 60, 90];
const DEFAULT_X_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DEFAULT_CHART_ID = 'lineCanvas';
const DEFAULT_MARK_LINE_COLOR = '#ccc';

const LineChart: React.FC<LineChartProps> = (props) => {
  const {
    width: propWidth,
    height: propHeight,
    id,
    data: propData,
    className,
    lineColor,
    dotColor,
    padding: propPadding,
    xLabels: propX,
    style,
  } = props;
  useEffect(() => {
    drawLineChart();
  }, []);

  const drawLineChart = () => {
    const query = Taro.createSelectorQuery();
    query
      .select(`#${id ?? DEFAULT_CHART_ID}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node as CanvasInterface;
        const ctx = canvas.getContext('2d') as CanvasContext;
        drawChart(ctx);
      });
  };

  const drawChart = (ctx: CanvasContext) => {
    // 初始化
    const data = propData ?? DEFAULT_DATA;
    const width = propWidth ?? DEFAULT_WIDTH;
    const height = propHeight ?? DEFAULT_HEIGHT;
    const padding = propPadding ?? DEFAULT_PADDING;
    const xLabels = propX ?? DEFAULT_X_LABELS;
    ctx.clearRect(0, 0, width, height);

    // 标识线
    ctx.strokeStyle = DEFAULT_MARK_LINE_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i <= data.length; i++) {
      const y = padding + (i * (height - 2 * padding)) / data.length;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 图
    ctx.strokeStyle = lineColor ?? DEFAULT_LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - (value / 70) * (height - 2 * padding);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = padding + ((index - 1) / (data.length - 1)) * (width - 2 * padding);
        const prevY = height - padding - (data[index - 1] / 70) * (height - 2 * padding);
        const cp1x = (prevX + x) / 2;
        const cp1y = prevY;
        const cp2x = (prevX + x) / 2;
        const cp2y = y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
    });
    ctx.stroke();

    // 数据点
    ctx.fillStyle = dotColor ?? DEFAULT_DOT_COLOR;
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - (value / 70) * (height - 2 * padding);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 坐标轴标签
    ctx.fillStyle = DEFAULT_TEXT_COLOR;
    ctx.font = '10px';
    const step = Math.ceil(Math.max(...data) / data.length);
    for (let i = 0; i <= data.length; i++) {
      const y = height - padding - (i * (height - 2 * padding)) / data.length;
      ctx.fillText((i * step).toString(), 5, y + 3);
    }
    xLabels.forEach((value, index) => {
      const x = padding + (index / (xLabels.length - 1)) * (width - 2 * padding);
      ctx.fillText(value, x - 3, height - 5);
    });
  };

  return (
    <Canvas
      id={id ?? DEFAULT_CHART_ID}
      width={propWidth + 'px'}
      height={propHeight + 'px'}
      className={className}
      style={style}
      type="2d"
    />
  );
};

export default LineChart;
