import { memo } from 'react';

import './index.scss';

import Notification from '../../modules/notification';

const Page: React.FC = memo(() => {
  return <Notification />;
});

export default Page;
