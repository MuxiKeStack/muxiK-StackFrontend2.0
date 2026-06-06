import { useEffect, useRef } from 'react';

export function useUpdateEffect(effect: () => void | (() => void), deps: unknown[]) {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
}
