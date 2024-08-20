import { Swiper, SwiperItem, Text, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

type FloatingWindowProps = object;

const FloatingWindow: React.FC<FloatingWindowProps> = () => {
  const pages = [<Page1 />, <Page2 />, <Page3 />, <Page4 />];

  return (
    <View className="floating_window_background">
      <Swiper
        className="floating_window_content"
        indicatorColor="#999"
        indicatorActiveColor="#333"
        circular
        indicatorDots
      >
        {pages.map((page, index) => (
          <SwiperItem key={index} className="floating_window_slide">
            {page}
          </SwiperItem>
        ))}
      </Swiper>
    </View>
  );
};

const Page1 = () => {
  return (
    <View>
      <Text className="page-title">
        木犀课栈隐私条例<Text>{'\n'}</Text>
      </Text>
      <Text className="page-content">
        作为华中师范大学学生自主运营的互联网技术团队，
        木犀一直高度重视隐私保护、郑重对待相应责任，
        并已将隐私保护的要求融入日常业务活动流程。<Text>{'\n'}</Text>
        希望您仔细阅读本条例，详细了解我们对信息的收集、使用方式，
        以便您更好地了解我们的服务并作出适当的选择。若您使用木犀课栈的服务，
        即表示您认同我们在本条例中所述内容。
      </Text>
    </View>
  );
};

const Page2 = () => {
  return (
    <View>
      <Text className="page-title">我们收集的信息</Text>
      <Text className="page-content">
        我们根据合法、正当、必要的原则，仅收集实现产品功能所必要的信息，
        并将竭力通过有效的信息安全技术及管理流程，防止您的信息泄露、损毁、丢失。
        1、您在使用我们服务时主动提供的信息：<Text>{'\n'}</Text>
        （1）您在登录时填写的信息。木犀课栈将采用华中师范大学一站式门户的账号密码进行登录，
        以此获取您的课程信息。<Text>{'\n'}</Text>
        （2）您在使用服务时填写的信息。例如您上传的头像。
      </Text>
    </View>
  );
};

const Page3 = () => {
  return (
    <View>
      <Text className="page-title">我们如何使用收集的信息</Text>
      <Text className="page-content">
        我们严格遵守法律法规的规定及与用户的约定，
        将收集的信息用于以下用途。若我们超出以下用途使用您的信息，
        我们将再次向您进行说明，并征得您的同意。 <Text>{'\n'}</Text>1、向您提供服务。
        <Text>{'\n'}</Text>
        2、产品开发和服务优化。例如，当我们的系统发生故障时，
        我们会记录和分析系统故障时产生的信息，优化我们的服务。
      </Text>
    </View>
  );
};

const Page4 = () => {
  return (
    <View>
      <Text className="page-title">联系我们</Text>
      <Text className="page-content">
        如您对本条例或其他相关事宜有疑问，<Text>{'\n'}</Text>
        请通过QQ群：799651462与我们联系。<Text>{'\n'}</Text>
        您也可以将问题发送至邮箱：i@muxistudio.com。<Text>{'\n'}</Text>
        我们将在验证您的用户身份后，尽快审核所涉问题并予以回复。<Text>{'\n'}</Text>
      </Text>
    </View>
  );
};

export default FloatingWindow;
