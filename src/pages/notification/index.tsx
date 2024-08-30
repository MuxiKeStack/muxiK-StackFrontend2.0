import { memo } from 'react';

import Notification from '@/modules/notification';

import './index.scss';

const Page: React.FC = memo(() => {
  return <Notification />;
});

export default Page;
