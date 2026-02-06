export interface LoadingProps {
  // 加载提示文本
  text?: string;
  // 加载指示器类型
  type?: 'circular' | 'spinner';
  // 加载指示器方向
  direction?: 'horizontal' | 'vertical';
  // 加载指示器大小
  size?: number | string;
  // 自定义容器样式
  containerStyle?: object;
  //自定义文本样式
  textStyle?: object;
  // 是否居于页面中间
  isCenter?: boolean;
}
