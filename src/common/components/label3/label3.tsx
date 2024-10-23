/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { View } from '@tarojs/components';

import './label3.scss';

export default function Label3(props) {
  const { handleChecked, handleClick } = props;

  const label3Checked = (id) => {
    if (id) handleChecked(id);
    handleClick();
    // console.log("已点击")
  };

  return (
    <View
      onClick={() => {
        return label3Checked(props.id);
      }}
      className="label3"
      style={
        props.checked
          ? 'background:#F18900;color:#F9F9F2;'
          : 'background: #F9F9F2;color: #F18900;'
      }
    >
      {props.content}
    </View>
  );
}
