import { Component, PropsWithChildren } from 'react';

import '@/common/styles/globals.scss';

import checkToken from '@/common/utils/checkToken';

class App extends Component<PropsWithChildren> {
  //TODO 写成加interceptor 但是我还没写明白 别急
  componentDidMount() {
    checkToken();
  }
  render() {
    return this.props.children;
  }
}

export default App;
