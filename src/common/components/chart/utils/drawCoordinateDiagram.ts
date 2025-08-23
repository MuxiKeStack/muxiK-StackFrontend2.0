export function drawCoordinateDiagram(
  ctx: Taro.CanvasContext,
  data: number[],
  [x, y]: [number, number], //原点坐标
  [isDrawXline, isDrawYline]: [boolean, boolean], //是否绘制x、y坐标线
  [xTextPos, yTextPos]: [number, number], //x轴标签绘制的y坐标，y轴标签绘制的x坐标
  width: number, //x轴长度
  height: number, //y轴长度
  xLabels: string[], //x轴标签
  yLables: string[], //y轴标签
  xRange: [number, number][], //x轴每个间隔的范围，与标签对应
  mappingFunction: (
    data: number[],
    x: [number, number],
    height: number,
    y: number
  ) => number, //x、y、data之间的映射函数
  axisLineColor: string, //坐标轴颜色
  gapLineColor: string, //分割线颜色，
  axisTextColor: string, //坐标轴标签颜色
  brokenLineColor: string //成绩分布图折线颜色
) {
  const xLableNum = xLabels.length;
  const yLabelNum = yLables.length;
  const xRangeCoordinate: number[] = [];

  //计算标签占比步长
  const calculateStep = (length: number, LabelsNum: number) => {
    return Math.floor(length / (LabelsNum - 1));
  };

  //绘制轴
  ctx.beginPath();
  ctx.strokeStyle = axisLineColor;
  ctx.lineWidth = 1;
  //轴线
  if (isDrawXline) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
  }

  if (isDrawYline) {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - height);
    ctx.stroke();
  }
  //轴标签
  const xStep = calculateStep(width, xLableNum);
  const yStep = calculateStep(height, yLabelNum);
  ctx.fillStyle = axisTextColor;
  ctx.font = '10px sans-serif';
  for (let i = 0; i < xLableNum; i++) {
    const text = xLabels[i];
    const textWidth = ctx.measureText(text).width;
    const textX = x + i * xStep - Math.floor(textWidth / 2);
    xRangeCoordinate.push(x + i * xStep);
    const textY = xTextPos;
    ctx.fillText(text, textX, textY);
  }
  for (let j = 0; j < yLabelNum; j++) {
    ctx.fillText(yLables[j], yTextPos, y - j * yStep + 3);
  }

  //绘制y轴分割线
  ctx.beginPath();
  ctx.strokeStyle = gapLineColor;
  ctx.lineWidth = 1;
  for (let j = 1; j < yLabelNum; j++) {
    ctx.moveTo(x, y - j * yStep);
    ctx.lineTo(x + width, y - j * yStep);
    ctx.stroke();
  }

  //绘制折线图
  const points: [number, number][] = [];
  for (let i = 0; i < xRange.length; i++) {
    const yCanvas = mappingFunction(data, xRange[i], height, y);
    if (Number.isNaN(yCanvas) || !Number.isFinite(yCanvas)) continue;
    points.push([xRangeCoordinate[i], yCanvas]);
  }

  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = brokenLineColor;
  ctx.lineWidth = 3;
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (Math.abs(curr[1] - prev[1]) < 1) {
      ctx.lineTo(curr[0], curr[1]); //y 值相同，直接直线连接
    } else {
      // 否则使用贝塞尔曲线
      const p0 = points[Math.max(i - 2, 0)];
      const p1 = prev;
      const p2 = curr;
      const p3 = points[Math.min(i + 1, points.length - 1)];
      const [c1, c2] = calculateBezierPoint(p0, p1, p2, p3);
      ctx.bezierCurveTo(...c1, ...c2, ...p2);
    }
  }
  ctx.stroke();
}
//计算三次贝塞尔曲线控制点
/**
 * @param p0
 * @param p1
 * @param p2
 * @param p3
 * @param t
 * B(t) = (1-t)³·P₀ + 3(1-t)²t·C₁ + 3(1-t)t²·C₂ + t³·P₁
 * 已知P₀、P₁，张力系数t，须求C₁、C₂.
 * 采用Catmull-Rom法
 */
function calculateBezierPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number], //p1前一点
  p3: [number, number] //p2后一点
  //   t = 0.25
): [[number, number], [number, number]] {
  //向量计算
  const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
  const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
  const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
  const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

  return [
    [cp1x, cp1y],
    [cp2x, cp2y],
  ];
}
