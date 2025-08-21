/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { View } from '@tarojs/components';

import './label3.scss';

export default function Label3(props) {
  const { handleChecked, handleClick } = props;

  const label3Checked = (id) => {
    id && handleChecked && handleChecked(id);
    handleClick && handleClick();
    // console.log("已点击")
  };

  return (
    <View
      onTouchEnd={() => {
        return label3Checked(props.id);
      }}
      className="label3"
      style={
        props.checked
          ? 'background:#FFFAEC;color:#F9B94F;'
          : 'background: #F9B94F;color: #FFFFFF;'
      }
    >
      {props.content}
    </View>
  );
}
