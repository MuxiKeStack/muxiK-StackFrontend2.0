/* eslint-disable */

import '@/common/styles/globals.scss';
import { Component, PropsWithChildren } from 'react';

import { checkToken } from '@/common/utils';

class App extends Component<PropsWithChildren> {
  async componentDidMount() {
    checkToken();
  }

  render() {
    return this.props.children;
  }
}

export default App;
