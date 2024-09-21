/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line simple-import-sort/imports
import { Canvas } from '@tarojs/components';
import Taro, { CanvasContext, Canvas as CanvasInterface } from '@tarojs/taro';
import React, { CSSProperties, useEffect, useState } from 'react';

interface LineChartProps {
  data?: number[];
  /** x轴标签 */
  xLabels?: string[];
  /** 边距 */
  padding?: number;
  style?: CSSProperties;
  /** y坐标后缀 */
  subfix?: string;
  /** 线条颜色 */
  lineColor?: string;
  className?: string;
  /** heightLight 在的比例 */
  heightLightPercent?: number;
  /** 容器id，默认为lineCanvas */
  id?: string;
  /** 标题 */
  title?: string;
  /** 画布宽高 */
  width?: number;
  height?: number;
}
const DEFAULT_HIGHLIGHT_COLOR = '#FFA5007F';
const DEFAULT_TEXT_COLOR = 'orange';
const DEFAULT_LINE_COLOR = 'orange';
const DEFAULT_PADDING = 30;
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 200;
const DEFAULT_DATA = [10, 20, 30, 40, 50];
const DEFAULT_X_LABELS = ['0-40', '50-60', '70-80', '80-90', '90-100'];
const DEFAULT_CHART_ID = 'lineCanvas';
const DEFAULT_MARK_LINE_COLOR = '#cccccc8f';
const BLANK = 20;
const DEFAULT_HEIGHTLIGHT_POS = 1;
const DEFAULT_TITLE = '平均分';

const LineChart: React.FC<LineChartProps> = (props) => {
  const {
    width: propWidth,
    height: propHeight,
    heightLightPercent,
    id,
    data: propData,
    className,
    lineColor,
    padding: propPadding,
    xLabels: propX,
    title,
    style,
    subfix,
  } = props;
  const [size, setSize] = useState<{ x: number; y: number }>({
    x: propWidth ?? DEFAULT_WIDTH,
    y: propHeight ?? DEFAULT_HEIGHT,
  });
  useEffect(() => {
    drawLineChart();
  }, []);
  const drawLineChart = () => {
    const query = Taro.createSelectorQuery();
    query
      .select(`#${id ?? DEFAULT_CHART_ID}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        const dpr = Taro.getSystemInfoSync().pixelRatio;
        const canvas = res[0].node as CanvasInterface;
        const { width, height } = canvas;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        // 设置 canvas 组件的样式宽高
        setSize({ x: width ?? 200, y: height ?? 200 });
        const ctx = canvas.getContext('2d') as CanvasContext;
        ctx.scale(dpr, dpr);
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
    // // 适配不同比例
    if (width / height > 2) {
      ctx.scale((height * 2) / width, 1);
    } else {
      ctx.scale(1, width / 2 / height);
    }
    const barWidth = (width - 2 * padding) / data.length;
    const lines = 5;
    // 背景
    drawRoundedRectangle(ctx, 0, 0, width, height, 10, () => null, '#f9f9f2');
    // 标识线
    ctx.beginPath();
    ctx.strokeStyle = DEFAULT_MARK_LINE_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i <= lines; i++) {
      const y = padding + (i * (height - 2 * padding)) / lines;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // 坐标轴标签
    ctx.fillStyle = DEFAULT_TEXT_COLOR;
    ctx.font = '10px sans-serif';
    // 平均分配标签，比如五根标签，最大为94.4，那么标签最大为95，按19递增
    const step = Math.floor(
      ((Math.floor(Math.max(...data) / lines) + 1) * lines) / lines
    );
    for (let i = 0; i <= lines; i++) {
      const y = height - padding - (i * (height - 2 * padding)) / lines;
      ctx.fillText((i * step).toString() + (subfix ? subfix : ''), 2, y + 3);
    }
    xLabels.forEach((value, index) => {
      const x = padding + index * barWidth + BLANK;
      ctx.fillText(value, x - 15, height - 5);
    });

    // 图
    ctx.strokeStyle = lineColor ?? DEFAULT_LINE_COLOR;
    ctx.lineWidth = 6;
    ctx.beginPath();
    const dots: { x: number; y: number }[] = [];
    data.forEach((value, index) => {
      const x = padding + index * barWidth + BLANK;
      const y = value
        ? height - padding - (value / (step * lines)) * (height - 2 * padding)
        : height - padding;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = padding + (index - 1) * barWidth;
        const prevY = dots.at(-1)!.y;
        const cp1x = (prevX + x) / 2;
        const cp1y = prevY;
        const cp2x = (prevX + x) / 2;
        const cp2y = y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
      dots.push({ x, y });
    });
    ctx.stroke();

    // 高亮
    ctx.lineWidth = 1;
    const highlightPos = heightLightPercent ?? DEFAULT_HEIGHTLIGHT_POS;
    const centerX = padding + barWidth * highlightPos + BLANK;
    drawGradientRectangle(
      ctx,
      centerX - barWidth / 2,
      padding - 6,
      barWidth,
      height - 2 * padding + 6,
      5
    );
    // 高亮文字
    ctx.beginPath();
    ctx.fillStyle = DEFAULT_TEXT_COLOR;
    ctx.font = '15px sans-serif';
    ctx.fillText(
      title ?? DEFAULT_TITLE,
      centerX - ctx.measureText(title ?? DEFAULT_TITLE).width / 2,
      padding / 2
    );
  };

  return (
    <Canvas
      id={id ?? DEFAULT_CHART_ID}
      width={(size?.x ?? DEFAULT_WIDTH + 'px') as string}
      height={(size?.y ?? DEFAULT_HEIGHT + 'px') as string}
      className={className}
      style={{
        ...style,
        ...{
          width: `${propWidth ?? DEFAULT_WIDTH}px`,
          height: `${propHeight ?? DEFAULT_HEIGHT}px`,
        },
      }}
      type="2d"
    />
  );
};

export default LineChart;

function drawRoundedRectangle(
  ctx: Taro.CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  addtionFn?: (ctx: Taro.CanvasContext) => void,
  background?: string
) {
  // 确保半径不超过宽度或高度的一半
  radius = Math.min(radius, width / 2, height / 2);
  addtionFn && addtionFn(ctx);

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
  ctx.lineTo(x + radius, y + height);
  ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
  ctx.lineTo(x, y + radius);
  ctx.arc(x + radius, y + radius, radius, Math.PI, (Math.PI * 3) / 2, false);
  ctx.closePath();
  if (background) {
    ctx.fillStyle = background;
    ctx.strokeStyle = background;
  }
  ctx.fill();
  ctx.stroke(); // 如果需要边框，也可以绘制
}

function drawGradientRectangle(
  ctx: Taro.CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  // 创建渐变
  drawRoundedRectangle(ctx, x, y, width, height, radius, () => {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, DEFAULT_HIGHLIGHT_COLOR); // 顶部不透明橙色
    gradient.addColorStop(1, 'rgba(255, 165, 0, 0)'); // 底部完全透明
    // 应用渐变并填充路径
    ctx.fillStyle = gradient;
  });
}
