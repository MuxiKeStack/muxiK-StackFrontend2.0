import { ScrollView, Text, View } from '@tarojs/components';
import { memo } from 'react';

const Popper: React.FC<{ onClose: () => void }> = memo(({ onClose }) => (
  <View className="fixed left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black/30">
    <ScrollView
      className="relative w-4/5 overflow-hidden rounded-lg bg-white shadow-lg"
      style={{ height: '70vh' }}
      scrollY
    >
      <Content onClose={onClose} />
    </ScrollView>
  </View>
));

const Content: React.FC<{ onClose: () => void }> = memo(({ onClose }) => (
  <>
    <View className="mx-auto max-w-3xl rounded-md bg-white p-4 shadow-md">
      <View className="relative mb-4 flex w-full items-center justify-center">
        <Text
          className="absolute right-0 m-1 border-none bg-transparent p-2 text-2xl font-bold text-gray-500 focus:outline-none"
          onClick={onClose}
        >
          x
        </Text>
        <View className="text-center text-2xl font-bold text-gray-700">
          木犀课栈隐私条例
        </View>
      </View>

      {/* 内容部分 */}
      <View className="bg-slate-0">
        <p>
          作为华中师范大学学生自主运营的互联网技术团队，木犀一直高度重视隐私保护、郑重对待相应责任，并已将隐私保护的要求融入日常业务活动流程。
        </p>

        <p>
          希望您仔细阅读本条例，详细了解我们对信息的收集、使用方式，以便您更好地了解我们的服务并作出适当的选择。若您使用木犀课栈的服务，即表示您认同我们在本条例中所述内容。
        </p>

        <h3 className="text-lg font-semibold text-gray-700">我们收集的信息</h3>

        <p>
          我们根据合法、正当、必要的原则，仅收集实现产品功能所必要的信息，并将竭力通过有效的信息安全技术及管理流程，防止您的信息泄露、损毁、丢失。
        </p>

        <h4 className="font-semibold text-gray-700">
          1. 您在使用我们服务时主动提供的信息
        </h4>
        <ul className="ml-5 list-disc">
          <li>
            您在登录时填写的信息。木犀课栈将采用华中师范大学一站式门户的账号密码进行登录，以此获取您的课程信息。
          </li>
          <li>您在使用服务时填写的信息。例如您上传的头像。</li>
          <li>
            我们的部分服务可能需要您提供特定的个人敏感信息来实现特定功能。若您选择不提供该类信息，则可能无法正常使用服务中的特定功能，但不影响您使用服务中的其他功能。
          </li>
        </ul>

        <h4 className="font-semibold text-gray-700">2. 我们在您使用服务时获取的信息</h4>
        <p>
          当您使用我们的服务时，我们可能会存储服务日志信息。例如搜索、查看的信息、服务故障信息等。
        </p>

        <h4 className="font-semibold text-gray-700">3. 其他相关信息</h4>
        <ul className="ml-5 list-disc">
          <li>
            其他用户分享的信息中含有您的信息。例如，其他用户分享的截图中可能包含您的信息。
          </li>
          <li>
            从第三方合作伙伴获取的信息。例如，您使用QQ授权登录时，我们会获得您登录的名称、登录时间，方便您进行授权管理。
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-700">我们如何使用收集的信息</h3>
        <ul className="ml-5 list-disc">
          <li>向您提供服务。</li>
          <li>产品开发和服务优化。</li>
          <li>确保服务的安全，帮助我们更好地了解应用程序的运行情况。</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-700">您分享的信息</h3>
        <p>
          您可以通过我们的服务与好友分享相关课程或评价信息。请注意，这其中可能包含您的个人身份信息，请谨慎考虑披露。
        </p>

        <h3 className="text-lg font-semibold text-gray-700">联系我们</h3>
        <p>如您对本条例或其他相关事宜有疑问，请通过QQ群：764752182与我们联系</p>
      </View>
    </View>
  </>
));

export default Popper;
