import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Report to crash analytics if available
    if (__DEV__) {
      console.log('Error stack:', errorInfo.componentStack);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRestart = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      // If Expo Updates is not available, just reset state
      this.handleReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-white justify-center items-center p-6">
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-error/20 rounded-full justify-center items-center mb-4">
              <Ionicons name="warning" size={48} color="#dc3545" />
            </View>
            <Text className="text-2xl font-bold text-textPrimary mb-2">
              Oops! Something went wrong
            </Text>
            <Text className="text-center text-textSecondary px-4">
              We apologize for the inconvenience. The app encountered an unexpected error.
            </Text>
          </View>

          <View className="w-full space-y-3">
            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-primary py-3 px-6 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.handleRestart}
              className="bg-gray-200 py-3 px-6 rounded-xl"
            >
              <Text className="text-textPrimary text-center font-semibold">
                Restart App
              </Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && this.state.error && (
            <ScrollView className="mt-8 p-4 bg-gray-100 rounded-xl max-h-48 w-full">
              <Text className="text-xs text-textMuted mb-2 font-semibold">
                Error Details (Development Only):
              </Text>
              <Text className="text-xs text-textMuted">
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text className="text-xs text-textMuted mt-2">
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;