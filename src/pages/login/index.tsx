import { View, Text, Image, Input, Button, Checkbox } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { useState } from "react";

import "./index.scss";
import top_background from "@/img/login/top_background.png";
import { FloatingWindow } from "@/components";

type LoginProps = object;

const Login: React.FC<LoginProps> = () => {
  useLoad(() => {
    console.log("Page loaded.");
  });

  const [floatingWindowOpenning, setFloatingWindowOpenning] = useState(false);

  return (
    <View className="login">
      <Image src={top_background} className="login_top_background"></Image>
      <View className="login_content">
        <View className="login_main">
          <View className="login_main_text">
            <Input className="login_input" placeholder="学号/昵称"></Input>
            <Input className="login_input" placeholder="密码"></Input>
            <Text className="login_link">Forget your password?</Text>
          </View>
          <View className="login_main_button">
            <Button className="login_button">学号登录</Button>
            <Button className="guest_button login_button">游客登录</Button>
          </View>
        </View>
        <View className="login_terms">
          <Checkbox value="" className="login_checkbox"></Checkbox>
          <Text className="login_terms_text">我已同意</Text>
          <View
            className="floating_window_switch"
            onClick={() => setFloatingWindowOpenning(true)}
          >
            《木犀课栈隐私条例》内的所有内容
          </View>
        </View>
      </View>
      {floatingWindowOpenning && <FloatingWindow />}
    </View>
  );
};

export default Login;
