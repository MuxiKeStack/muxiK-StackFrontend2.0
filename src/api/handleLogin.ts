import Taro from "@tarojs/taro";

const preUrl = "https://kstack.muxixyz.com";

const handleLogin = async (data = {}) => {

  const header = {
    "Content-Type": "application/json;charset=utf-8"
  };

  Taro.setStorage({
    key: "shortToken",
    data: "shortToken",
  });

  Taro.setStorage({
    key: "longToken",
    data: "longToken",
  });

  try {
    const response = await Taro.request({
      method: "POST",
      url: `${preUrl}/users/login_ccnu`,
      header,
      data: JSON.stringify(data),
    });

    const headers = response.header || {};
    const shortToken = headers['X-Jwt-Token'];
    const longToken = headers['X-Refresh-Token'];

    if (shortToken && longToken) {
      Taro.setStorage({
        key: "shortToken",
        data: shortToken.toString(),
        success: () => {
          console.log("shortToken 设置成功");
          // 方便看情况 log 出 shortToken 后期上线之前删除掉这个
          console.log(shortToken);
        }
      });

      Taro.setStorage({
        key: "longToken",
        data: longToken.toString(),
        success: () => {
          console.log("longToken 设置成功");
          // 方便看情况 log 出 longToken 后期上线之前删除掉这个
          console.log(longToken);
        }
      });
      Taro.navigateTo({
        url: "/pages/personalPage/index",
      });
    }

    if (response.data.code !== 0) {
      console.log("登陆失败(code 不为 0)");
      Taro.showToast({
        icon:"error",
        title:response.data.msg,
        }
      )
    }

    if (!response.statusCode.toString().startsWith("2")) {
      throw new Error(`${response.statusCode}`);
    }

  } catch (error) {
    console.log(error);
  }
};

export default handleLogin;
