import React, { useState,useRef } from 'react';
import { View, Input, Image } from '@tarojs/components';
import './SearchInput.scss'

type SearchInputProps = {
  onSearchToggle: () => void;
  onSearch: (searchText: string) => void; // 添加搜索请求的回调函数
  searchPlaceholder: string;
  searchPlaceholderStyle: string;
  searchIconSrc: string;
};

const SearchInput: React.FC<SearchInputProps> = ({ onSearchToggle, onSearch, searchPlaceholder, searchPlaceholderStyle, searchIconSrc }) => {
  // const [isSearchActive, setIsSearchActive] = useState(true);
  const [searchText, setSearchText] = useState(''); // 添加状态来存储搜索文本

  // const handleClick = () => {
  //   // if (!isSearchActive) {
  //     // setIsSearchActive(true);
  //     onSearchToggle();
  //   // }
  // };

  // const handleBlur = () => {
  //   // if (isSearchActive) {
  //   //   setIsSearchActive(false);
  //     onSearchToggle();
  //   // }
  // };

  // 添加点击图片时的搜索逻辑
  const handleImageClick = (e: any) => {
    // 阻止事件冒泡
    e.stopPropagation();
    console.log(2);
    onSearch(searchText); // 发送搜索请求
  };

  const handleInputChange = (e: any) => {
    setSearchText(e.target.value); // 更新搜索文本
  };

  const inputRef = useRef(null);

  const handleClick = (e: any) => {
    // 阻止事件冒泡
    e.stopPropagation();
    // 你的其他逻辑...
    onSearchToggle();
  };

  // ...组件的其余部分

  return (
    <View>
      <Input
        // onBlur={handleBlur}
        onClick={handleClick} // 点击输入框时切换搜索状态
        value={searchText} // 绑定输入框的值
        onInput={handleInputChange} // 绑定输入框的值变化事件
        className='searchInput'
        type='text'
        placeholder={searchPlaceholder}
        placeholderStyle={searchPlaceholderStyle}
        ref={inputRef}
      />
      <Image
        style={{ width: '34.09rpx', height: '34.09rpx' }}
        className='search'
        src={searchIconSrc}
        onClick={handleImageClick} // 绑定点击图片的事件
      />
    </View>
  );
};

export default SearchInput;