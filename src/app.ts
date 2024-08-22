import { Component, PropsWithChildren } from 'react';

import '@/common/styles/app.scss';

class App extends Component<PropsWithChildren> {
  // this.props.children 是将要会渲染的页面
  render() {
    return this.props.children;
  }
}

export default App;
