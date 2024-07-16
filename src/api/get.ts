import Taro from "@tarojs/taro";
const preUrl = "https://kstack.muxixyz.com";
export async function get(url: string) {
  let token: string = "";
  const getToken = () => {
    return new Promise<string>((resolve, reject) => {
      Taro.getStorage({
        key: "shortToken",
        success: (res) => resolve(res.data),
        fail: (err) => reject(err)
      });
    });
  };
  // 获取token
  token = await getToken();
  const header = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json;charset=utf-8",
  };
  try {
    const response = await Taro.request({
      method: "GET",
      url: `${preUrl}${url}`,
      header,
    })
    if (response.data.code !== 0) {
      console.log("code不为0");
    }
    console.log(response.data.data);
    return response.data.data
  } catch (error) {
    console.error(error);
  }
}
