/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Image, Input, View } from '@tarojs/components';
import React, { useRef, useState } from 'react';

import './SearchInput.scss';

type SearchInputProps = {
  onSearchToggle: () => void;
  onSearch: (searchText: string) => void; // 添加搜索请求的回调函数
  searchPlaceholder: string;
  searchPlaceholderStyle: string;
  searchIconSrc: string;
  autoFocus?: boolean;
  disabled?: boolean;
};

const SearchInput: React.FC<SearchInputProps> = ({
  onSearchToggle,
  onSearch,
  searchPlaceholder,
  searchPlaceholderStyle,
  searchIconSrc,
  autoFocus,
  disabled,
}) => {
  // const [isSearchActive, setIsSearchActive] = useState(true);
  const [searchText, setSearchText] = useState(''); // 添加状态来存储搜索文本

  // 添加点击图片时的搜索逻辑
  const handleImageClick = (e: any) => {
    // 阻止事件冒泡
    e.stopPropagation();
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
        className="searchInput"
        type="text"
        placeholder={searchPlaceholder}
        placeholderStyle={searchPlaceholderStyle}
        ref={inputRef}
        onConfirm={handleImageClick} // 绑定回车事件
        autoFocus={autoFocus}
        disabled={disabled}
        confirmType="search"
      />
      <Image
        style={{ width: '34.09rpx', height: '34.09rpx' }}
        className="search"
        src={searchIconSrc}
        onClick={handleImageClick} // 绑定点击图片的事件
      />
    </View>
  );
};

export default SearchInput;
