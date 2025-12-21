import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BackButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        position: 'absolute',
        top: 40, // adjust for SafeArea if needed
        left: 16,
        zIndex: 10,
        padding: 8,
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={28} color="#2e7d32" />
    </TouchableOpacity>
  );
};

export default BackButton;