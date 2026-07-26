import { drawGradientRectangle } from './drawRoundedRect';

export function drawBottomInfo(
  ctx: Taro.CanvasContext,
  avgScore: number,
  minScore: number,
  maxScore: number,
  [x, y]: [number, number],
  width: number
) {
  const step = Math.floor(width / 3);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#3D3D3D';
  const text = [
    `最高分：${maxScore.toFixed(2)}`,
    `最低分：${minScore.toFixed(2)}`,
    `平均分：${avgScore.toFixed(2)}`,
  ];
  for (let i = 0; i < 3; i++) {
    ctx.fillText(text[i], x + i * step, y);
  }
}

export function drawHightlightScore(
  ctx: Taro.CanvasContext,
  [x, y]: [number, number],
  ox: number,
  height: number,
  singleWidth: number,
  text: string,
  textColor: string,
  gradientFn: (ctx: Taro.CanvasGradient) => void
) {
  drawGradientRectangle(
    ctx,
    x - singleWidth < ox ? ox : x - singleWidth,
    y - height,
    singleWidth * 2,
    height,
    [5, 5, 0, 0],
    gradientFn
  );

  ctx.beginPath();
  ctx.fillStyle = textColor;
  ctx.font = '12px sans-serif';
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, x - textWidth / 2, y - height - 10);
}
