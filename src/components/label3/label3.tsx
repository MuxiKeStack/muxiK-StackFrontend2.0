import { View } from '@tarojs/components';
import './label3.scss';

export default function Label3(props) {
  const { handleChecked } = props;

  const label3Checked = (id) => {
    handleChecked(id);
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
