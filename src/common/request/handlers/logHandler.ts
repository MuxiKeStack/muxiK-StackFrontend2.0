import { DEBUG } from '@/common/config/features';

import { BusinessError } from '../errors/BusinessError';
import type { ErrorHandler } from '../errors/ErrorPipeline';

export const logHandler: ErrorHandler = (ctx) => {
  if (DEBUG.ERROR_LEVEL === 'silent') return;

  const { error } = ctx;
  const tag = error.context.page || 'unknown';

  if (DEBUG.ERROR_LEVEL === 'verbose') {
    console.error(
      `[${error.name}] at ${tag}: ${error.message}`,
      '\nstack:',
      error.stack,
      '\ncontext:',
      JSON.stringify(error.context, null, 2),
      error instanceof BusinessError ? `\ncode: ${error.code}` : ''
    );
  } else {
    const extra = error instanceof BusinessError ? ` [code=${error.code}]` : '';
    console.error(`[${error.name}]${extra} at ${tag}: ${error.message}`);
  }
};
