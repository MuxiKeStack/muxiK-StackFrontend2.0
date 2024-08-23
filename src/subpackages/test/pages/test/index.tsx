import { Component, PropsWithChildren } from 'react';

import './index.scss';

import Test from '../../modules';

export default class Index extends Component<PropsWithChildren> {
  render() {
    return (
      <>
        <Test />
      </>
    );
  }
}
