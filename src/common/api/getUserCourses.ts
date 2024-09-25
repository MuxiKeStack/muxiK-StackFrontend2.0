import Taro from '@tarojs/taro';

const preUrl = 'https://kstack.muxixyz.com';
export async function getUserCourses(year: string, term: string) {
  try {
    let token: string = '';
    const getToken = () => {
      return new Promise<string>((resolve, reject) => {
        void Taro.getStorage({
          key: 'shortToken',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          success: (res) => resolve(res.data),
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          fail: (err) => reject(err),
        });
      });
    };
    // 获取token
    token = await getToken();
    const header = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=utf-8',
    };
    const response = await Taro.request({
      method: 'GET',
      url: `${preUrl}/courses/list/mine?year=${year}&term=${term}`,
      header,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (response.data.code !== 0) {
      console.log('code不为0');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(response.data.data);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
}
