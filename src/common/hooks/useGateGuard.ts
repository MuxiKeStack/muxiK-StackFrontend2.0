import { useEffect, useState } from 'react';

import { checkStatus } from '@/common/request/api/status';

type GateStatus = 'loading' | 'pass' | 'block';

export function useGateGuard(): GateStatus {
  const [status, setStatus] = useState<GateStatus>('loading');

  useEffect(() => {
    checkStatus()
      .then((res) => setStatus(res.status ? 'pass' : 'block'))
      .catch(() => setStatus('block'));
  }, []);

  return status;
}
