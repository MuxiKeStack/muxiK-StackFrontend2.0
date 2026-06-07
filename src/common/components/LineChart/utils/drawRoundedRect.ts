//绘制圆角矩形
export function drawRoundedRectangle(
  ctx: Taro.CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number[], //左上、右上、右下、左下
  addtionFn?: (ctx: Taro.CanvasContext) => void,
  background?: string
) {
  // 确保半径不超过宽度或高度的一半
  const [ltr, rtr, rbr, lbr] = radius.map((r) => Math.min(r, width / 2, height / 2));
  addtionFn && addtionFn(ctx);
  /**     begin
   *        ↓
   * x,y->x+ltr,y->x+width-rtr,y->x+width,y
   * ↑                            ↓
   * x,y+ltr                  x+width,y+rtr
   * ↑                            ↓
   * x,y+height-lbr           x+width,y+height-rbr
   * ↑                            ↓
   * x,y+height ←.......... ← x+width,y+height
   */
  ctx.beginPath();
  ctx.moveTo(x + ltr, y);
  ctx.lineTo(x + width - rtr, y);
  ctx.arc(x + width - rtr, y + rtr, rtr, -Math.PI / 2, 0, false);
  ctx.lineTo(x + width, y + height - rbr);
  ctx.arc(x + width - rbr, y + height - rbr, rbr, 0, Math.PI / 2, false);
  ctx.lineTo(x + lbr, y + height);
  ctx.arc(x + lbr, y + height - lbr, lbr, Math.PI / 2, Math.PI, false);
  ctx.lineTo(x, y + ltr);
  ctx.arc(x + ltr, y + ltr, ltr, Math.PI, (Math.PI * 3) / 2, false);
  ctx.closePath();
  if (background) {
    ctx.fillStyle = background;
    ctx.strokeStyle = background;
  }
  ctx.fill();
  ctx.stroke(); // 如果需要边框，也可以绘制
}

//绘制渐变色矩形
export function drawGradientRectangle(
  ctx: Taro.CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number[],
  gradientFn: (ctx: Taro.CanvasGradient) => void
) {
  // 创建渐变
  drawRoundedRectangle(ctx, x, y, width, height, radius, () => {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradientFn(gradient);
    // 应用渐变并填充路径
    ctx.setFillStyle(gradient);
  });
}
