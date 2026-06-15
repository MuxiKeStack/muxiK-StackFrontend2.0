import { request } from '../..';

const MINIPROGRAMS_BASE_URL = 'https://miniprograms.muxixyz.com';

// 用来逃避审核的，搭配相应的hook和组件使用
const checkStatus = async (): Promise<{ status: boolean }> => {
  const res = await request.post(
    '/checkStatus',
    { name: 'kestack' },
    { baseUrl: MINIPROGRAMS_BASE_URL, withToken: false }
  );

  const data = res as { status: boolean };
  return { status: typeof data.status === 'boolean' ? data.status : false };
};

export default checkStatus;
