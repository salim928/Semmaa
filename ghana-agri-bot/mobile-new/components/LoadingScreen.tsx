import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  fullScreen = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (fullScreen) {
    return (
      <LinearGradient
        colors={['#c8e6c9', '#ffffff']}
        className="flex-1 justify-center items-center"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center"
        >
          <View className="w-32 h-32 bg-primary rounded-3xl justify-center items-center mb-6">
            <Ionicons name="leaf" size={60} color="#ffffff" />
          </View>
          <ActivityIndicator size="large" color="#006400" />
          <Text className="text-textSecondary mt-4">{message}</Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#006400" />
      <Text className="text-textSecondary mt-4">{message}</Text>
    </View>
  );
};

export default LoadingScreen;