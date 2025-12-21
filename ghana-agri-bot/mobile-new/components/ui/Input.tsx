import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerClassName?: string;
  inputClassName?: string;
  type?: 'text' | 'password' | 'email' | 'phone' | 'number';
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  rightIcon,
  onRightIconPress,
  containerClassName = '',
  inputClassName = '',
  type = 'text',
  required = false,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const isPassword = type === 'password';
  const showPassword = isPassword && isPasswordVisible;

  const borderColor = error 
    ? 'border-error' 
    : isFocused 
    ? 'border-primary' 
    : 'border-borderColor';

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <View className="flex-row mb-2">
          <Text className="text-sm text-textSecondary">
            {label}
          </Text>
          {required && (
            <Text className="text-error ml-1">*</Text>
          )}
        </View>
      )}

      <View 
        className={`
          flex-row items-center
          border-2 ${borderColor}
          rounded-xl px-4
          ${error ? 'bg-error/5' : 'bg-white'}
        `}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? '#dc3545' : isFocused ? '#006400' : '#999999'}
            style={{ marginRight: 8 }}
          />
        )}

        <TextInput
          className={`
            flex-1 py-3 text-base text-textPrimary
            ${inputClassName}
          `}
          placeholderTextColor="#999999"
          keyboardType={getKeyboardType()}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="p-1"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#999999"
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            className="p-1"
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color="#999999"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View className="flex-row items-center mt-1">
          <Ionicons name="alert-circle" size={14} color="#dc3545" />
          <Text className="text-xs text-error ml-1">{error}</Text>
        </View>
      )}

      {hint && !error && (
        <Text className="text-xs text-textMuted mt-1">{hint}</Text>
      )}
    </View>
  );
};

export default Input;