import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../config/api';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import BackButton from '../../components/BackButton';
import { convertSpeechToText, speakText } from '../../utils/speechToText';
import { analyzeImage, analyzeCropDisease, analyzePest } from '../../utils/imageAnalysis';



interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  loading?: boolean;
  // optional feedback state for AI messages
  rating?: 'up' | 'down';
}

const HEADER_HEIGHT = 56;

const ChatScreen = () => {
  // hide default navigator header (so the "ChatScreen" title disappears)
  const navigation = useNavigation();
  useLayoutEffect(() => {
    // safe-guard: some navigation implementations need this; if it errors remove it
    // TypeScript users may need to cast navigation as any to access setOptions
    try {
      (navigation as any).setOptions?.({ headerShown: false });
    } catch (e) {
      // ignore if not available
    }
  }, [navigation]);

  const { location, selectedCrops, addChatMessage } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! 👋 I'm your SemmaAI assistant. How can I help with your farming needs today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [feedbackSendingId, setFeedbackSendingId] = useState<string | null>(null);

  const quickActions = [
    { label: '🌽 Maize', query: 'Tell me about maize farming' },
    { label: '🥔 Cassava', query: 'How to grow cassava?' },
    { label: '🍅 Tomatoes', query: 'Tomato pest control' },
    { label: '🌾 Rice', query: 'Rice cultivation tips' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const loadingMessage: Message = {
      id: `${Date.now()}_loading`,
      text: '...',
      sender: 'ai',
      timestamp: new Date(),
      loading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await apiService.askQuestion(text, location);

      const aiMessage: Message = {
        id: `${Date.now()}_ai`,
        text: response?.answer || 'I apologize, but I could not process your question. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(m => !m.loading).concat(aiMessage));

      // Save to chat history (if app context expects these fields)
      addChatMessage?.({
        id: userMessage.id,
        text: userMessage.text,
        sender: 'user',
        timestamp: userMessage.timestamp,
      });
      addChatMessage?.({
        id: aiMessage.id,
        text: aiMessage.text,
        sender: 'ai',
        timestamp: aiMessage.timestamp,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev =>
        prev.filter(m => !m.loading).concat({
          id: `${Date.now()}_error`,
          text: 'Sorry, I encountered an error. Please check your connection and try again.',
          sender: 'ai',
          timestamp: new Date(),
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendFeedback = async (messageId: string, rating: 'up' | 'down') => {
    const target = messages.find(m => m.id === messageId);
    if (!target || target.sender !== 'ai') return;

    // Optimistically update UI
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, rating }
          : m
      ),
    );

    try {
      setFeedbackSendingId(messageId);
      await apiService.submitFeedback(
        rating === 'up' ? 5 : 1,
        undefined,
        location,
      );
    } catch (error) {
      // If feedback fails, silently log but keep UI
      console.error('Failed to submit feedback', error);
    } finally {
      setFeedbackSendingId(null);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please grant microphone permission to use voice input');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        // Convert speech to text
        const result = await convertSpeechToText(uri);
        
        if (result.success && result.text) {
          setInputText(result.text);
          Alert.alert('Voice Input', 'Voice converted to text! You can edit it before sending.');
        } else {
          Alert.alert(
            'Voice Input', 
            result.error || 'Voice to text conversion is not configured yet. Please add your API keys in the settings.'
          );
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      Alert.alert('Image Analysis', 'Image analysis feature coming soon!');
    }
  };

  const takePicture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please grant camera permission to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageAnalysis(result.assets[0].uri);
    }
  };

  const handleImageAnalysis = async (imageUri: string) => {
    try {
      // Show options for analysis type
      Alert.alert(
        'Image Analysis',
        'What would you like to analyze?',
        [
          {
            text: 'Crop Disease',
            onPress: async () => {
              const loadingId = Date.now().toString();
              const loadingMsg: Message = {
                id: loadingId,
                text: 'Analyzing image for crop diseases...',
                sender: 'ai',
                timestamp: new Date(),
                loading: true,
              };
              setMessages(prev => [...prev, loadingMsg]);

              const result = await analyzeCropDisease(imageUri);
              
              setMessages(prev => prev.filter(m => m.id !== loadingId));
              
              if (result.success && result.analysis) {
                const { disease, confidence, recommendations, description } = result.analysis;
                let responseText = description || '';
                
                if (disease) {
                  responseText = `🔍 Detected Disease: ${disease}\n`;
                  if (confidence) {
                    responseText += `Confidence: ${(confidence * 100).toFixed(1)}%\n\n`;
                  }
                  responseText += description || '';
                  
                  if (recommendations && recommendations.length > 0) {
                    responseText += '\n\n📋 Recommendations:\n';
                    recommendations.forEach((rec, idx) => {
                      responseText += `${idx + 1}. ${rec}\n`;
                    });
                  }
                }
                
                const aiMessage: Message = {
                  id: `${Date.now()}_ai`,
                  text: responseText,
                  sender: 'ai',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);
              } else {
                const errorMessage: Message = {
                  id: `${Date.now()}_ai_error`,
                  text: `❌ Error: ${result.error || 'Failed to analyze image'}\n\nMake sure your backend API is running and configured correctly.`,
                  sender: 'ai',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
              }
            },
          },
          {
            text: 'Pest Detection',
            onPress: async () => {
              const loadingId = Date.now().toString();
              const loadingMsg: Message = {
                id: loadingId,
                text: 'Analyzing image for pests...',
                sender: 'ai',
                timestamp: new Date(),
                loading: true,
              };
              setMessages(prev => [...prev, loadingMsg]);

              const result = await analyzePest(imageUri);
              
              setMessages(prev => prev.filter(m => m.id !== loadingId));
              
              if (result.success && result.analysis) {
                const { pest, confidence, recommendations, description } = result.analysis;
                let responseText = description || '';
                
                if (pest) {
                  responseText = `🐛 Detected Pest: ${pest}\n`;
                  if (confidence) {
                    responseText += `Confidence: ${(confidence * 100).toFixed(1)}%\n\n`;
                  }
                  responseText += description || '';
                  
                  if (recommendations && recommendations.length > 0) {
                    responseText += '\n\n🛡️ Control Measures:\n';
                    recommendations.forEach((rec, idx) => {
                      responseText += `${idx + 1}. ${rec}\n`;
                    });
                  }
                }
                
                const aiMessage2: Message = {
                  id: `${Date.now()}_ai`,
                  text: responseText,
                  sender: 'ai',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage2]);
              } else {
                const errorMessage2: Message = {
                  id: `${Date.now()}_ai_error`,
                  text: `❌ Error: ${result.error || 'Failed to analyze image'}\n\nMake sure your backend API is running and configured correctly.`,
                  sender: 'ai',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage2]);
              }
            },
          },
          {
            text: 'General Analysis',
            onPress: async () => {
              const loadingId = Date.now().toString();
              const loadingMsg: Message = {
                id: loadingId,
                text: 'Analyzing image...',
                sender: 'ai',
                timestamp: new Date(),
                loading: true,
              };
              setMessages(prev => [...prev, loadingMsg]);

              const result = await analyzeImage(imageUri);
              
              setMessages(prev => prev.filter(m => m.id !== loadingId));
              
              if (result.success && result.analysis) {
                const { health_status, recommendations, description } = result.analysis;
                let responseText = description || '';
                
                if (health_status) {
                  responseText = `🌱 Health Status: ${health_status}\n\n${description || ''}`;
                  
                  if (recommendations && recommendations.length > 0) {
                    responseText += '\n\n💡 Recommendations:\n';
                    recommendations.forEach((rec, idx) => {
                      responseText += `${idx + 1}. ${rec}\n`;
                    });
                  }
                }
                
                const aiMessage3: Message = {
                  id: `${Date.now()}_ai`,
                  text: responseText,
                  sender: 'ai',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage3]);
              } else {
                const errorMessage3: Message = {
                  id: `${Date.now()}_ai_error`,
                  text: `❌ Error: ${result.error || 'Failed to analyze image'}\n\nMake sure your backend API is running and configured correctly.`,
                  sender: 'ai',
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage3]);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze image');
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isAI = message.sender === 'ai';

    if (message.loading) {
      return (
        <View style={[styles.row, isAI ? styles.justifyStart : styles.justifyEnd, styles.mb3]}>
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#006400" />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.row, isAI ? styles.justifyStart : styles.justifyEnd, styles.mb3]}>
        <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
          <Text style={isAI ? styles.textPrimary : styles.textUser}>{message.text}</Text>
          <Text style={styles.time}>
            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isAI && (
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackLabel}>Was this helpful?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  onPress={() => sendFeedback(message.id, 'up')}
                  style={[
                    styles.feedbackButton,
                    message.rating === 'up' && styles.feedbackButtonActive,
                  ]}
                  disabled={feedbackSendingId === message.id}
                >
                  <Ionicons
                    name="thumbs-up"
                    size={16}
                    color={message.rating === 'up' ? '#065f46' : '#6b7280'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => sendFeedback(message.id, 'down')}
                  style={[
                    styles.feedbackButton,
                    message.rating === 'down' && styles.feedbackButtonActive,
                  ]}
                  disabled={feedbackSendingId === message.id}
                >
                  <Ionicons
                    name="thumbs-down"
                    size={16}
                    color={message.rating === 'down' ? '#b91c1c' : '#6b7280'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const topPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPadding }]}>
      {/* Custom header: back button at left (absolute) + centered title "SemmaAI" */}
      <View style={[styles.headerRow, { height: HEADER_HEIGHT }]}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            onPress={() => {
              try {
                (navigation as any).goBack?.();
              } catch (e) {}
            }}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#064e3b" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>SemmaAI</Text>
        </View>

        {/* Spacer to balance layout */}
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_HEIGHT + 30 : HEADER_HEIGHT + 10}
      >
        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsBar}
          contentContainerStyle={{ alignItems: 'center', paddingLeft: 12 }}
        >
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} onPress={() => sendMessage(action.query)} style={styles.quickAction} disabled={isLoading}>
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messages}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
        >
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={pickImage} style={styles.inputIcon} disabled={isLoading}>
              <Ionicons name="image" size={24} color="#006400" />
            </TouchableOpacity>

            <TouchableOpacity onPress={takePicture} style={styles.inputIcon} disabled={isLoading}>
              <Ionicons name="camera" size={24} color="#006400" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type your farming question..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!isLoading}
              onSubmitEditing={() => {
                if (!inputText.includes('\n')) sendMessage(inputText);
              }}
            />

            {inputText.trim() ? (
              <TouchableOpacity onPress={() => sendMessage(inputText)} style={styles.sendButton} disabled={isLoading}>
                <Ionicons name="send" size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPressIn={startRecording}
                onPressOut={stopRecording}
                style={[styles.micButton, recording ? styles.micButtonRecording : styles.micButtonIdle]}
                disabled={isLoading}
              >
                <Ionicons name="mic" size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Generic
  row: { flexDirection: 'row' },
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  mb3: { marginBottom: 12 },

  // Bubbles
  bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '75%' },
  bubbleAI: { backgroundColor: '#e6f4ea' },
  bubbleUser: { backgroundColor: '#f3f3f3' },
  textPrimary: { color: '#006400', fontSize: 15 },
  textUser: { color: '#222', fontSize: 15 },
  time: { fontSize: 11, color: '#888', marginTop: 6, alignSelf: 'flex-end' },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  feedbackLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginRight: 8,
  },
  feedbackButtons: {
    flexDirection: 'row',
  },
  feedbackButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    backgroundColor: '#f9fafb',
  },
  feedbackButtonActive: {
    backgroundColor: '#ecfdf3',
    borderColor: '#4ade80',
  },
  loadingBubble: { backgroundColor: '#e6f4ea', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '75%' },

  // Quick Actions
  quickActionsBar: { maxHeight: 56, paddingVertical: 8, borderBottomColor: '#eee', borderBottomWidth: 1, backgroundColor: '#fff' },
  quickAction: { backgroundColor: '#fff', borderColor: '#006400', borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  quickActionText: { color: '#006400', fontSize: 14 },

  // Messages
  messages: { flex: 1, paddingHorizontal: 16 },

  // Input Area
  inputBar: { borderTopColor: '#eee', borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  inputIcon: { padding: 8, marginRight: 6 },
  textInput: { flex: 1, backgroundColor: '#f3f3f3', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 128, fontSize: 15 },
  sendButton: { marginLeft: 8, padding: 10, backgroundColor: '#006400', borderRadius: 999 },
  micButton: { marginLeft: 8, padding: 10, borderRadius: 999 },
  micButtonIdle: { backgroundColor: '#006400' },
  micButtonRecording: { backgroundColor: '#d32f2f' },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  headerSide: {
    width: 44, // same width as back button area
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#064e3b',
  },
});
