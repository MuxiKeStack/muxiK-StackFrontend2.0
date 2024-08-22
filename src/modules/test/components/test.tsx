import { View } from '@tarojs/components';
import React, { useEffect } from 'react';

import useTokenCheck from '@/common/hooks/useTokenCheck';

const Test: React.FC = React.memo(() => {
  const checkToken = useTokenCheck();

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  return <View></View>;
});

export default Test;
