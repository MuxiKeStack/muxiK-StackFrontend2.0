import { useCallback, useRef, useState } from 'react';

export function usePullToRefresh(onRefresh: () => void | Promise<void>) {
  const [refresherTriggered, setRefresherTriggered] = useState(false);
  const busyRef = useRef(false);

  const onRefresherRefresh = useCallback(async () => {
    if (busyRef.current) return;

    busyRef.current = true;
    setRefresherTriggered(true);
    try {
      await onRefresh();
    } finally {
      busyRef.current = false;
      setRefresherTriggered(false);
    }
  }, [onRefresh]);

  return {
    refresherEnabled: true as const,
    refresherTriggered,
    onRefresherRefresh,
  };
}
