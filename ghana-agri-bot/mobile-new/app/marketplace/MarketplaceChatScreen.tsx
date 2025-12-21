import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Image,
  Linking,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'seller';
  timestamp: Date;
  type: 'text' | 'image' | 'voice';
  imageUri?: string;
}

const MarketplaceChatScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Parse params (safe)
  let seller: { id?: string; name?: string; phone?: string; avatar?: string } | undefined;
  let product: { name?: string; price?: string; image?: string } | undefined;

  if (params.seller) {
    try {
      seller = JSON.parse(params.seller as string);
    } catch {
      // ignore parse error
    }
  }
  if (!seller && (params.sellerId || params.sellerName)) {
    seller = {
      id: params.sellerId as string | undefined,
      name: params.sellerName as string | undefined,
      phone: params.sellerPhone as string | undefined,
      avatar: params.sellerAvatar as string | undefined,
    };
  }

  if (params.product) {
    try {
      product = JSON.parse(params.product as string);
    } catch {
      // ignore parse error
    }
  }
  if (!product && (params.productName || params.price)) {
    product = {
      name: params.productName as string | undefined,
      price: params.price as string | undefined,
      image: (params.productImage as string) || undefined,
    };
  }

  const [missingShown, setMissingShown] = useState(false);

  const defaultProductName = product?.name ?? 'Product';
  const defaultProductPrice = product?.price ?? '0';

  const [messages, setMessages] = useState<ChatMessage[]>(
    [
      {
        id: '1',
        text: `Hello, I'm interested in your ${defaultProductName}. Is it still available?`,
        sender: 'me',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
      },
      {
        id: '2',
        text: `Yes! I have 500kg ready. Fresh harvest from yesterday.`,
        sender: 'seller',
        timestamp: new Date(Date.now() - 3000000),
        type: 'text',
      },
      {
        id: '3',
        text: `Can you do GHS ${(parseFloat(defaultProductPrice || '0') * 0.95).toFixed(2)}/kg for 100kg?`,
        sender: 'me',
        timestamp: new Date(Date.now() - 2400000),
        type: 'text',
      },
      {
        id: '4',
        text: `For 100kg, I can do GHS ${(parseFloat(defaultProductPrice || '0') * 0.97).toFixed(2)}/kg. That's my best price.`,
        sender: 'seller',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
      },
      {
        id: '5',
        text: 'Deal! When can I pick up?',
        sender: 'me',
        timestamp: new Date(Date.now() - 1200000),
        type: 'text',
      },
      {
        id: '6',
        text: "Tomorrow morning at my farm. I'll send you the location.",
        sender: 'seller',
        timestamp: new Date(Date.now() - 600000),
        type: 'text',
      },
    ]
  );

  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  // scroll to bottom whenever messages change
  useEffect(() => {
    if (!seller || !product) return;
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // show missing-data alert once and navigate back
  useEffect(() => {
    if (!seller || !product) {
      if (!missingShown) {
        Alert.alert('Missing data', 'Seller or product info is missing.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        setMissingShown(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller, product]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  if (!seller || !product) return null;

  const sellerName = seller.name ?? 'Seller';
  const productName = product.name ?? 'Product';

  const sendMessage = (text: string, type: 'text' | 'image' | 'voice' = 'text', imageUri?: string) => {
    if (type === 'text' && !text.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim() || (type === 'image' ? '📷 Photo' : '🎤 Voice message'),
      sender: 'me',
      timestamp: new Date(),
      type,
      imageUri,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate a seller response for demo
    if (type === 'text') {
      setTimeout(() => {
        const sellerResponse: ChatMessage = {
          id: `${Date.now()}_seller`,
          text: generateSellerResponse(text),
          sender: 'seller',
          timestamp: new Date(),
          type: 'text',
        };
        setMessages(prev => [...prev, sellerResponse]);
      }, 1200);
    }
  };

  const generateSellerResponse = (userMessage: string): string => {
    const lower = (userMessage || '').toLowerCase();

    if (/price|cost/.test(lower)) {
      return `The current price is GHS ${product.price ?? '0'} per kg. For bulk orders above 50kg, I can offer a small discount.`;
    }
    if (/quality/.test(lower)) {
      return 'All my produce is Grade A quality, freshly harvested and properly stored.';
    }
    if (/deliver|delivery/.test(lower)) {
      return 'I can arrange delivery within Kumasi for an additional GHS 20. Outside Kumasi, we can discuss.';
    }
    if (/payment/.test(lower)) {
      return 'I accept cash on delivery or mobile money. For large orders, 50% upfront is required.';
    }
    if (/location|where/.test(lower)) {
      return "My farm is located 15km from Kumasi city center, near Ejisu. I can share the exact location when you're ready to visit.";
    }
    return 'Thank you for your message. Feel free to ask any questions about the produce!';
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      const uri = result?.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        sendMessage('📷 Photo shared', 'image', uri);
      }
    } catch (err) {
      console.error('pickImage error', err);
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const takePhoto = async () => {
    try {
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

      const uri = result?.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        sendMessage('📷 Photo shared', 'image', uri);
      }
    } catch (err) {
      console.error('takePhoto error', err);
      Alert.alert('Error', 'Could not take photo');
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please grant microphone permission for voice messages');
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
      setRecording(null);
      sendMessage('🎤 Voice message', 'voice');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isMe = message.sender === 'me';
    return (
      <View style={[styles.messageRow, { alignItems: isMe ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleSeller]}>
          {message.type === 'image' && message.imageUri ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: message.imageUri }} style={styles.imageContent} />
              <View style={styles.imageIconOverlay}>
                <Ionicons name="image" size={20} color="#666" />
              </View>
            </View>
          ) : null}
          <Text style={isMe ? styles.textWhite : styles.textPrimary}>{message.text}</Text>
          <Text style={[styles.time, isMe ? styles.textWhite70 : styles.textMuted]}>
            {formatTime(message.timestamp)} {isMe && <Ionicons name="checkmark-done" size={12} color="#fff" />}
          </Text>
        </View>
      </View>
    );
  };

  const QuickReply = ({ text }: { text: string }) => (
    <TouchableOpacity onPress={() => sendMessage(text)} style={styles.quickReply}>
      <Text style={styles.quickReplyText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 64}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#006400" />
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              {seller?.avatar ? (
                <Image source={{ uri: seller.avatar }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={20} color="#fff" />
              )}
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.sellerName}>{sellerName}</Text>
              <Text style={styles.onlineText}>● Online</Text>
            </View>

            <TouchableOpacity
              style={styles.iconAction}
              onPress={() => {
                if (seller?.phone) Linking.openURL(`tel:${seller.phone}`);
                else Alert.alert('No phone', 'Seller phone number is not available');
              }}
            >
              <Ionicons name="call" size={20} color="#006400" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconAction}
              onPress={() =>
                router.push({
                  pathname: '/marketplace/SellerProfile',
                  params: { seller: JSON.stringify(seller) },
                })
              }
            >
              <Ionicons name="information-circle-outline" size={20} color="#006400" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product info / quick bar */}
        <View style={styles.productBar}>
          <Text style={styles.productBarText}>
            Discussing: <Text style={styles.productBarBold}>{productName}</Text> at{' '}
            <Text style={styles.productBarBold}>GHS {product.price ?? '0'}/kg</Text>
          </Text>
        </View>

        {/* Compact product card (optional) */}
        {product?.image ? (
          <View style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productCardImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.productCardTitle}>{product.name}</Text>
              <Text style={styles.productCardPrice}>GHS {product.price ?? '0'}/kg</Text>
            </View>
            <TouchableOpacity
              style={styles.productCardBtn}
              onPress={() =>
                router.push({
                  pathname: '/marketplace/ProductDetailScreen',
                  params: { product: JSON.stringify(product) },
                })
              }
            >
              <Ionicons name="chevron-forward" size={18} color="#006400" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messages}
          contentContainerStyle={{ paddingBottom: 220, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dateDivider}>
            <View style={styles.dateDividerInner}>
              <Text style={styles.dateDividerText}>Today</Text>
            </View>
          </View>

          {messages.map(m => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </ScrollView>

        {/* Quick replies */}
        <View style={styles.quickRepliesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <QuickReply text="What's your best price?" />
            <QuickReply text="Can you deliver?" />
            <QuickReply text="Is it still available?" />
            <QuickReply text="Payment options?" />
          </ScrollView>
        </View>

        {/* Input area */}
        <View style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={pickImage} style={styles.inputIcon}>
              <Ionicons name="image" size={22} color="#006400" />
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto} style={styles.inputIcon}>
              <Ionicons name="camera" size={22} color="#006400" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
            />

            {inputText.trim() ? (
              <TouchableOpacity onPress={() => sendMessage(inputText)} style={styles.sendButton}>
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPressIn={startRecording}
                onPressOut={stopRecording}
                style={[styles.micButton, recording ? styles.micButtonRecording : styles.micButtonIdle]}
              >
                <Ionicons name="mic" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Order Now */}
        <View style={styles.orderNowWrap}>
          <TouchableOpacity
            style={styles.orderNowBtn}
            onPress={() =>
              router.push({
                pathname: '/marketplace/OrderScreen',
                params: { product: JSON.stringify(product), seller: JSON.stringify(seller) },
              })
            }
          >
            <Text style={styles.orderNowText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MarketplaceChatScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex1: { flex: 1 },
  header: {
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 12 : 6,
    paddingBottom: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 10,
    top: Platform.OS === 'ios' ? 14 : 8,
    zIndex: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: Platform.OS === 'ios' ? 8 : 0 },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: '#006400',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: { width: 40, height: 40, borderRadius: 20 },
  sellerName: { fontWeight: '600', color: '#222', fontSize: 16 },
  onlineText: { fontSize: 12, color: '#16a34a' },
  iconAction: { padding: 8, marginLeft: 8 },

  productBar: {
    backgroundColor: 'rgba(16,185,129,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  productBarText: { fontSize: 14, color: '#222' },
  productBarBold: { fontWeight: '700', color: '#064e3b' },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    padding: 8,
    elevation: 1,
  },
  productCardImage: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  productCardTitle: { fontWeight: '700', color: '#111' },
  productCardPrice: { color: '#006400', fontWeight: '600', marginTop: 4 },
  productCardBtn: { padding: 6 },

  messages: { flex: 1, paddingHorizontal: 16 },
  dateDivider: { alignItems: 'center', marginBottom: 12 },
  dateDividerInner: { backgroundColor: '#eee', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  dateDividerText: { fontSize: 12, color: '#888' },

  messageRow: { marginBottom: 12 },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  bubbleMe: { backgroundColor: '#006400', borderBottomRightRadius: 4 },
  bubbleSeller: { backgroundColor: '#eee', borderBottomLeftRadius: 4 },
  textWhite: { color: '#fff', fontSize: 15 },
  textPrimary: { color: '#111', fontSize: 15 },
  textWhite70: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 },
  textMuted: { color: '#666', fontSize: 12, marginTop: 6 },
  time: { fontSize: 12 },

  imagePreview: { width: 220, height: 120, backgroundColor: '#ccc', borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  imageContent: { width: '100%', height: '100%' },
  imageIconOverlay: { position: 'absolute', right: 8, bottom: 8, backgroundColor: '#fff', borderRadius: 16, padding: 4 },

  quickRepliesContainer: { borderTopColor: '#eee', borderTopWidth: 1, paddingVertical: 8, backgroundColor: '#fff' },
  quickReply: { backgroundColor: '#fff', borderColor: '#006400', borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  quickReplyText: { color: '#006400', fontSize: 14 },

  inputBar: { borderTopColor: '#eee', borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputIcon: { padding: 8, marginRight: 6 },
  textInput: { flex: 1, backgroundColor: '#f3f3f3', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 120 },
  sendButton: { marginLeft: 8, padding: 10, backgroundColor: '#006400', borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  micButton: { marginLeft: 8, padding: 10, borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  micButtonIdle: { backgroundColor: '#006400' },
  micButtonRecording: { backgroundColor: '#d32f2f' },

  orderNowWrap: { alignItems: 'center', paddingVertical: 12, backgroundColor: '#fff' },
  orderNowBtn: { backgroundColor: '#006400', borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12 },
  orderNowText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
