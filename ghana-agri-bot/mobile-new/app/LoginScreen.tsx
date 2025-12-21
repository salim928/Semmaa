import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import BackButton from '../components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle } from '../utils/googleAuth';

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // For testing, accept any email/password
      if (email && password) {
        // Mock login - replace with actual login when backend is ready
        await login(email, email.split('@')[0] || 'User');
        
        // Navigate to tabs - FIXED ROUTE
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', 'Please enter email and password');
      }
    } catch (error) {
      Alert.alert('Login Failed', error?.message || 'Please try again.');
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
          style={styles.keyboardAvoid}
        >
          <View style={styles.container}>
            <Image
              source={require('../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Log in to your SemmaAI account</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#888"
              autoComplete="email"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#888"
              autoComplete="password"
            />
            
            <TouchableOpacity
              style={[styles.button, (!email || !password || loading) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>

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
            </TouchableOpacity>
            </TouchableOpacity>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/SignUpScreen')}>
                <Text style={styles.signupLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  flex1: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#006400',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#222',
    width: '100%',
  },
  button: {
    backgroundColor: '#006400',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#b7e0c7',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '600' 
  },
  forgotPassword: {
    marginTop: 16,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#006400',
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 15,
  },
  signupLink: {
    color: '#006400',
    fontWeight: 'bold',
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 16,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});