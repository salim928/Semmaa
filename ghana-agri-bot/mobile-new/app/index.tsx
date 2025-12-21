import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const OnboardingScreen = () => {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#c8e6c9', '#ffffff']}
      style={styles.flex1}
    >
      <SafeAreaView style={styles.flex1}>
        <View style={styles.container}>
          {/* Logo Container */}
          <View style={styles.logoBox}>
            {/* Add your logo image here */}
            <Image
              source={require('../assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            {/* Optionally keep the Ionicons leaf icon for accent */}
            {/* <Ionicons name="leaf" size={60} color="#ffffff" style={{ position: 'absolute' }} /> */}
          </View>

          {/* App Title */}
          <Text style={styles.title}>
            SemmaAI
          </Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            Smarter Advice. Bigger Harvests.
          </Text>

          {/* Mission Statement */}
          <Text style={styles.mission}>
            AI-powered advisory for African farmers
          </Text>

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              onPress={() => router.push('/SignUpScreen')}
              style={[styles.button, styles.buttonPrimary]}
            >
              <Text style={styles.buttonPrimaryText}>
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/LoginScreen')}
              style={[styles.button, styles.buttonSecondary]}
            >
              <Text style={styles.buttonSecondaryText}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles-outline" size={24} color="#006400" />
              <Text style={styles.featureText}>AI Chat</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="storefront-outline" size={24} color="#006400" />
              <Text style={styles.featureText}>Market</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="wallet-outline" size={24} color="#006400" />
              <Text style={styles.featureText}>Wallet</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="cloud-outline" size={24} color="#006400" />
              <Text style={styles.featureText}>Weather</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 128,
    height: 128,
    backgroundColor: '#006400',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden', // ensures the logo is clipped to the rounded box
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 28,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: '#228B22',
    textAlign: 'center',
    marginBottom: 6,
  },
  mission: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 36,
    paddingHorizontal: 16,
  },
  buttonGroup: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  buttonPrimary: {
    backgroundColor: '#006400',
  },
  buttonPrimaryText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: '#228B22',
  },
  buttonSecondaryText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  featuresRow: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#228B22',
    marginTop: 4,
  },
});