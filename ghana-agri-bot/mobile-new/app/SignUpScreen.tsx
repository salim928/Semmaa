import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useRouter } from 'expo-router';
import BackButton from '../components/BackButton';
import { signInWithGoogle } from '../utils/googleAuth';

const SignUpScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const { setLocation, setCoordinates } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationText, setLocationText] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const getGPSLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for localized advice');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get location name
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        const locationName = place.city || place.region || 'Ghana';
        setLocationText(locationName);
        setCoordinates({ lat: latitude, lon: longitude });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please enter manually.');
    }
  };

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (!locationText.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the Data Policy');
      return;
    }

    try {
      setLoading(true);
      
      // Set location in app context
      setLocation(locationText);
      
      // Login with phone and name
      await login(phone, name);
      
      // Navigate to home tab - FIXED ROUTE
      router.replace('/(tabs)/home');
      
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex1}>
      <BackButton />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Logo at the top */}
          <View style={styles.logoBox}>
            <Image
              source={require('../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>
              Welcome, Farmer! 👋
            </Text>
            <Text style={styles.headerSubtitle}>
              Let's get you started with SemmaAI
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#999"
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.phonePrefix}>🇬🇭 +233</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="24 123 4567"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={9}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Location Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Enter your city/town"
                value={locationText}
                onChangeText={setLocationText}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                onPress={getGPSLocation}
                style={styles.gpsButton}
              >
                <Ionicons name="location" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Agreement Checkbox */}
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            style={styles.agreeRow}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              agreed ? styles.checkboxChecked : styles.checkboxUnchecked
            ]}>
              {agreed && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </View>
            <Text style={styles.agreeText}>
              I agree to the Data Policy
            </Text>
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading || !name || !phone || !locationText || !agreed}
            style={[
              styles.continueButton, 
              (loading || !name || !phone || !locationText || !agreed) && styles.continueButtonDisabled
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={async () => {
              setGoogleLoading(true);
              const result = await signInWithGoogle();
              setGoogleLoading(false);
              
              if (result.success) {
                Alert.alert('Success', 'Signed in with Google successfully!');
                router.replace('/(tabs)/home');
              } else {
                Alert.alert('Error', result.error || 'Failed to sign in with Google');
              }
            }}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/LoginScreen')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  flex1: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  scrollContent: { 
    paddingVertical: 40, 
    paddingHorizontal: 24 
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: '#006400',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
  headerBox: { 
    marginBottom: 32 
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#006400', 
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: { 
    color: '#666', 
    fontSize: 15,
    textAlign: 'center',
  },
  inputGroup: { 
    marginBottom: 18 
  },
  inputLabel: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  phonePrefix: { 
    fontSize: 16, 
    marginRight: 8, 
    color: '#222' 
  },
  phoneInput: { 
    flex: 1, 
    paddingVertical: 14, 
    fontSize: 16 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  gpsButton: {
    backgroundColor: '#006400',
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agreeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { 
    backgroundColor: '#006400', 
    borderColor: '#006400' 
  },
  checkboxUnchecked: { 
    backgroundColor: '#fff', 
    borderColor: '#e0e0e0' 
  },
  agreeText: { 
    color: '#666', 
    fontSize: 14 
  },
  continueButton: {
    backgroundColor: '#006400',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 18,
    alignItems: 'center',
  },
  continueButtonDisabled: { 
    backgroundColor: '#b7e0c7' 
  },
  continueButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  dividerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 18 
  },
  divider: { 
    flex: 1, 
    height: 1, 
    backgroundColor: '#e0e0e0' 
  },
  dividerText: { 
    marginHorizontal: 12, 
    color: '#999', 
    fontSize: 13 
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  googleButtonText: { 
    marginLeft: 8, 
    color: '#222', 
    fontSize: 15 
  },
  loginRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 18 
  },
  loginText: { 
    color: '#666', 
    fontSize: 14 
  },
  loginLink: { 
    color: '#006400', 
    fontWeight: '600', 
    fontSize: 14 
  },
});