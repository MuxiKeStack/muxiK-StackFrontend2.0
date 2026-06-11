/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Icon, Image, Input, Text, View } from '@tarojs/components';
import React, { CSSProperties, useRef, useState } from 'react';

import './index.scss';

// 自由后缀
type SuffixConfig = {
  text: string;
  onClick?: () => void;
  style?: CSSProperties;
};

type SearchInputProps = {
  onSearchToggle?: () => void;
  onSearch: (searchText: string) => void; // 添加搜索请求的回调函数
  searchPlaceholder: string;
  searchPlaceholderStyle: string;
  searchIconSrc: string;
  searchText?: string; //受控模式
  setSearchText?: (searchText: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  showClearButton?: boolean;
  suffix?: SuffixConfig;
};

const SearchInput: React.FC<SearchInputProps> = ({
  onSearchToggle,
  onSearch,
  searchPlaceholder,
  searchPlaceholderStyle,
  searchIconSrc,
  disabled,
  style,
  searchText,
  setSearchText,
  showClearButton = true,
  suffix,
}) => {
  // const [isSearchActive, setIsSearchActive] = useState(true);
  const [customSearchText, setCustomSearchText] = useState(searchText || ''); // 添加状态来存储搜索文本
  const [isFocused, setIsFocused] = useState(false);

  const isControlled = searchText !== undefined;
  const value = isControlled ? searchText : customSearchText;

  // 添加点击图片时的搜索逻辑
  const handleImageClick = (e: any) => {
    // 阻止事件冒泡
    e.stopPropagation();
    if (searchText) {
      onSearch(searchText);
      return;
    }
    onSearch(customSearchText); // 发送搜索请求
  };

  const handleInputChange = (e: any) => {
    const nextValue = e.detail?.value ?? e.target?.value ?? '';
    if (setSearchText) {
      setSearchText(nextValue);
      return;
    }
    setCustomSearchText(nextValue);
  };

  const inputRef = useRef(null);

  const handleClick = (e: any) => {
    // 阻止事件冒泡
    e.stopPropagation();
    onSearchToggle?.();
  };

  const handleClear = () => {
    if (isControlled) {
      setSearchText?.('');
    } else {
      setCustomSearchText('');
    }
  };

  const handleSuffixClick = (e: any) => {
    e.stopPropagation();
    if (suffix?.onClick) {
      suffix.onClick();
    } else {
      handleImageClick(e);
    }
  };

  return (
    <View className="search_container">
      <Image
        style={{ width: '34rpx', height: '34rpx' }}
        className="search_icon"
        src={searchIconSrc}
        onClick={handleImageClick}
      />

      <Input
        onClick={handleClick}
        value={searchText || customSearchText}
        onInput={handleInputChange}
        className={`search_input ${isFocused ? `active` : ''}`}
        style={style}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        type="text"
        placeholder={searchPlaceholder}
        placeholderStyle={searchPlaceholderStyle}
        ref={inputRef}
        onConfirm={handleImageClick}
        disabled={disabled}
        confirmType="search"
      />

      <View className="search_right_area">
        {value.length > 0 && showClearButton && (
          <Icon
            className="search_clear_button"
            size={12}
            type="clear"
            onClick={handleClear}
          />
        )}
        {suffix && (
          <View className="search_suffix_container" onClick={handleSuffixClick}>
            <Text className="search_suffix" style={suffix.style}>
              {suffix.text}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchInput;
