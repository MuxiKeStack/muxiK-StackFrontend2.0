import { useEffect, useState } from 'react';

import { FEATURES } from '@/common/config/features';
import { checkStatus } from '@/common/request/api/status';

type GateStatus = 'loading' | 'pass' | 'block';
type GateResult = { status: boolean };

let cachedPromise: Promise<GateResult> | null = null;
let cachedResult: GateResult | null = null;

function gateFromResult(result: GateResult): GateStatus {
  return result.status ? 'pass' : 'block';
}

function gateFromCache(): GateStatus {
  if (cachedResult) return gateFromResult(cachedResult);
  return 'loading';
}

async function resolveGateStatus(): Promise<GateResult> {
  if (!FEATURES.CHECK_STATUS) {
    return { status: true };
  }

  if (cachedResult) return cachedResult;

  if (!cachedPromise) {
    cachedPromise = checkStatus()
      .then((result) => {
        cachedResult = result;
        return result;
      })
      .catch(() => {
        const result = { status: false };
        cachedResult = result;
        return result;
      })
      .finally(() => {
        cachedPromise = null;
      });
  }

  return cachedPromise;
}

export function invalidateGateGuardCache(): void {
  cachedPromise = null;
  cachedResult = null;
}

export function useGateGuard(): GateStatus {
  const [status, setStatus] = useState<GateStatus>(() => {
    if (!FEATURES.CHECK_STATUS) return 'pass';
    return gateFromCache();
  });

  useEffect(() => {
    if (!FEATURES.CHECK_STATUS) return;
    if (cachedResult) return;

    let cancelled = false;

    void resolveGateStatus().then((res) => {
      if (!cancelled) setStatus(gateFromResult(res));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
