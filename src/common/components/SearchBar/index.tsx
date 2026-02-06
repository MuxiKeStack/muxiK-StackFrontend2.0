import { Icon, Image, Input, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

import searchIcon from '../../assets/img/search.png';
import { SearchBarProps } from './type';

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '搜索',
  containerStyle,
  inputStyle,
  placeholderTextColor = '#9CA3AF',
}) => {
  return (
    <View className="search-bar" style={containerStyle}>
      <Image className="search-icon" src={searchIcon} />

      <Input
        className="search-input"
        style={inputStyle}
        value={value}
        onInput={(e) => onChange(e.detail.value)}
        onConfirm={onSubmit}
        placeholder={placeholder}
        placeholderStyle={`color: ${placeholderTextColor};`}
      />

      {value.length > 0 && (
        <Icon
          className="clear-button"
          size={12}
          type="clear"
          onClick={() => onChange('')}
        />
      )}
    </View>
  );
};

export default SearchBar;
