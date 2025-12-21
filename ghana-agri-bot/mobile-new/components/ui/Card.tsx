import React from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onPress?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  shadow = true,
  rounded = 'xl',
  onPress,
  className = '',
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-2';
      case 'lg':
        return 'p-6';
      case 'md':
      default:
        return 'p-4';
    }
  };

  const getRounded = () => {
    switch (rounded) {
      case 'sm':
        return 'rounded';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case '2xl':
        return 'rounded-2xl';
      case 'xl':
      default:
        return 'rounded-xl';
    }
  };

  const cardStyles = `
    bg-white
    ${getPadding()}
    ${getRounded()}
    ${className}
  `.trim();

  const shadowStyle = shadow ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } : {};

  if (onPress) {
    return (
      <TouchableOpacity
        className={cardStyles}
        style={[shadowStyle, style]}
        onPress={onPress}
        activeOpacity={0.9}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={cardStyles}
      style={[shadowStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;