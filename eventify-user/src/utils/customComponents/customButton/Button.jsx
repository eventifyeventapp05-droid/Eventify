import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather'; // ← Feather imported here
import {globalStyles} from '../../../styles/globalStyles';
import {theme} from '../../../styles/theme';

const Button = ({
  onPress,
  title,
  loading,
  style,
  textStyle,
  width,
  disabled,
  backgroundColor,
  textColor,
  iconName,
  iconSize = 20,
  iconColor,
  iconStyle,
  iconPosition = 'left', // left or right
}) => {
  const renderIcon = () =>
    iconName ? (
      <Feather
        name={iconName}
        size={iconSize}
        color={iconColor || textColor}
        style={[{marginHorizontal: 6}, iconStyle]}
      />
    ) : null;

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          globalStyles.buttonPrimary,
          style,
          {
            width: width || 'auto',
            backgroundColor: disabled ? theme.colors.gray : backgroundColor,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        activeOpacity={disabled ? 1 : 0.9}>
        {loading ? (
          <ActivityIndicator color={textColor} size={width * 0.06} />
        ) : (
          <>
            {iconPosition === 'left' && renderIcon()}
            <Text
              style={[globalStyles.textPrimary, textStyle, {color: textColor}]}>
              {title}
            </Text>
            {iconPosition === 'right' && renderIcon()}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Button;
