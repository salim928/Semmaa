import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  className = '',
  textClassName = '',
  ...props
}) => {
  const getVariantStyles = (): { container: string; text: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-primary',
          text: 'text-white',
        };
      case 'secondary':
        return {
          container: 'bg-secondary',
          text: 'text-white',
        };
      case 'outline':
        return {
          container: 'border-2 border-primary bg-transparent',
          text: 'text-primary',
        };
      case 'ghost':
        return {
          container: 'bg-transparent',
          text: 'text-primary',
        };
      case 'danger':
        return {
          container: 'bg-error',
          text: 'text-white',
        };
      default:
        return {
          container: 'bg-primary',
          text: 'text-white',
        };
    }
  };

  const getSizeStyles = (): { container: string; text: string; iconSize: number } => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-3 py-2',
          text: 'text-sm',
          iconSize: 16,
        };
      case 'lg':
        return {
          container: 'px-6 py-4',
          text: 'text-lg',
          iconSize: 24,
        };
      case 'md':
      default:
        return {
          container: 'px-4 py-3',
          text: 'text-base',
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyles = `
    rounded-xl flex-row items-center justify-center
    ${variantStyles.container}
    ${sizeStyles.container}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50' : ''}
    ${className}
  `.trim();

  const textStyles = `
    font-semibold
    ${variantStyles.text}
    ${sizeStyles.text}
    ${icon && iconPosition === 'left' ? 'ml-2' : ''}
    ${icon && iconPosition === 'right' ? 'mr-2' : ''}
    ${textClassName}
  `.trim();

  const iconColor = variant === 'outline' || variant === 'ghost' ? '#006400' : '#ffffff';

  return (
    <TouchableOpacity
      className={containerStyles}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size={size === 'sm' ? 'small' : 'small'}
          color={iconColor}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={iconColor}
            />
          )}
          <Text className={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={iconColor}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;