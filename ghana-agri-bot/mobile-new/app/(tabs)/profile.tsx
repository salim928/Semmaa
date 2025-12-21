import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { language, setLanguage, selectedCrops, setSelectedCrops } = useApp();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'name' | 'location' | 'crops' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const scaleAnim = new Animated.Value(0.95);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tw', name: 'Twi', flag: '🇬🇭' },
    { code: 'ga', name: 'Ga', flag: '🇬🇭' },
    { code: 'ee', name: 'Ewe', flag: '🇬🇭' },
    { code: 'dag', name: 'Dagbani', flag: '🇬🇭' },
  ];

  const cropOptions = [
    'Maize', 'Cassava', 'Tomatoes', 'Rice', 'Plantain',
    'Yam', 'Cocoa', 'Groundnut', 'Pepper', 'Okra',
    'Cowpea', 'Millet', 'Sorghum', 'Oil Palm', 'Cashew'
  ];

  const stats = [
    { label: 'Farm Size', value: '5 acres', icon: 'resize', color: '#10b981' },
    { label: 'Active Crops', value: '3', icon: 'leaf', color: '#f59e0b' },
    { label: 'Experience', value: '5 years', icon: 'time', color: '#8b5cf6' },
    { label: 'Rating', value: '4.8', icon: 'star', color: '#fbbf24' },
  ];

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/OnboardingScreen');
          }
        },
      ]
    );
  };

  const handleEditProfile = (field: 'name' | 'location' | 'crops') => {
    setEditField(field);
    if (field === 'name') setEditValue(user?.name || '');
    else if (field === 'location') setEditValue(user?.location || '');
    else if (field === 'crops') setEditValue(selectedCrops.join(', '));
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editField) return;

    try {
      if (editField === 'crops') {
        const crops = editValue.split(',').map(c => c.trim()).filter(Boolean);
        setSelectedCrops(crops);
        await updateProfile({ crops });
      } else {
        await updateProfile({ [editField]: editValue });
      }
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLanguageChange = async (lang: string) => {
    await setLanguage(lang);
    setLanguageModalVisible(false);
    Alert.alert('Language Changed', `Language set to ${languages.find(l => l.code === lang)?.name}`);
  };

  const MenuItem = ({
    icon,
    label,
    value,
    onPress,
    showArrow = true,
    color,
    gradient,
    isSwitch = false,
    switchValue,
    onSwitchChange,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    color?: string;
    gradient?: string[];
    isSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => {
    const itemAnim = new Animated.Value(0);
    
    React.useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ opacity: itemAnim, transform: [{ scale: itemAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          style={styles.menuItem}
          activeOpacity={onPress || isSwitch ? 0.95 : 1}
          disabled={isSwitch}
        >
          {gradient ? (
            <LinearGradient colors={gradient} style={styles.menuIconGradient}>
              <Ionicons name={icon as any} size={22} color="#fff" />
            </LinearGradient>
          ) : (
            <View style={[styles.menuIconBox, { backgroundColor: (color || '#10b981') + '20' }]}>
              <Ionicons name={icon as any} size={22} color={color || '#10b981'} />
            </View>
          )}
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>{label}</Text>
            {value && <Text style={styles.menuValue}>{value}</Text>}
          </View>
          {isSwitch ? (
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={switchValue ? '#10b981' : '#f3f4f6'}
              ios_backgroundColor="#e5e7eb"
            />
          ) : showArrow ? (
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <LinearGradient
              colors={['#10b981', '#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              {/* Pattern Overlay */}
              <View style={styles.headerPattern}>
                {[...Array(4)].map((_, i) => (
                  <View key={i} style={[styles.patternCircle, { 
                    left: `${i * 25}%`,
                    top: `${Math.sin(i) * 20 + 50}%`,
                  }]} />
                ))}
              </View>

              <View style={styles.headerContent}>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <Animated.View style={[styles.avatarContainer, { transform: [{ scale: scaleAnim }] }]}>
                  <LinearGradient
                    colors={['#fbbf24', '#f59e0b']}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0).toUpperCase() || 'F'}
                    </Text>
                  </LinearGradient>
                  <TouchableOpacity style={styles.cameraButton}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>

                <Text style={styles.profileName}>{user?.name || 'Farmer'}</Text>
                <Text style={styles.profilePhone}>{user?.phone || '+233 24 123 4567'}</Text>
                
                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={14} color="#86efac" />
                  <Text style={styles.locationText}>{user?.location || 'Ghana'}</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                  {stats.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                      <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={styles.quickAction} activeOpacity={0.9}>
                <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.quickActionGradient}>
                  <Ionicons name="trophy" size={24} color="#fff" />
                  <Text style={styles.quickActionText}>Achievements</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction} activeOpacity={0.9}>
                <LinearGradient colors={['#ec4899', '#db2777']} style={styles.quickActionGradient}>
                  <Ionicons name="ribbon" size={24} color="#fff" />
                  <Text style={styles.quickActionText}>Certifications</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction} activeOpacity={0.9}>
                <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.quickActionGradient}>
                  <Ionicons name="stats-chart" size={24} color="#fff" />
                  <Text style={styles.quickActionText}>Analytics</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <TouchableOpacity onPress={() => handleEditProfile('name')}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sectionCard}>
              <MenuItem
                icon="person"
                label="Full Name"
                value={user?.name}
                onPress={() => handleEditProfile('name')}
                gradient={['#10b981', '#059669']}
              />
              <MenuItem
                icon="call"
                label="Phone Number"
                value={user?.phone}
                showArrow={false}
                color="#3b82f6"
              />
              <MenuItem
                icon="location"
                label="Location"
                value={user?.location || 'Ghana'}
                onPress={() => handleEditProfile('location')}
                color="#ec4899"
              />
            </View>
          </View>

          {/* Farm Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Farm Details</Text>
            </View>
            
            <View style={styles.sectionCard}>
              <MenuItem
                icon="leaf"
                label="Active Crops"
                value={selectedCrops.join(', ') || 'Not set'}
                onPress={() => handleEditProfile('crops')}
                gradient={['#f59e0b', '#d97706']}
              />
              <MenuItem
                icon="resize"
                label="Farm Size"
                value="5 acres"
                color="#8b5cf6"
              />
              <MenuItem
                icon="calendar"
                label="Farming Since"
                value="2019"
                showArrow={false}
                color="#06b6d4"
              />
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>
            
            <View style={styles.sectionCard}>
              <MenuItem
                icon="notifications"
                label="Push Notifications"
                isSwitch={true}
                switchValue={notificationsEnabled}
                onSwitchChange={setNotificationsEnabled}
                color="#10b981"
              />
              <MenuItem
                icon="moon"
                label="Dark Mode"
                isSwitch={true}
                switchValue={darkModeEnabled}
                onSwitchChange={setDarkModeEnabled}
                color="#6366f1"
              />
              <MenuItem
                icon="language"
                label="Language"
                value={languages.find(l => l.code === language)?.name || 'English'}
                onPress={() => setLanguageModalVisible(true)}
                gradient={['#3b82f6', '#2563eb']}
              />
            </View>
          </View>

          {/* Support & About */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Support & About</Text>
            </View>
            
            <View style={styles.sectionCard}>
              <MenuItem
                icon="help-circle"
                label="Help Center"
                color="#06b6d4"
              />
              <MenuItem
                icon="shield-checkmark"
                label="Privacy Policy"
                color="#6b7280"
              />
              <MenuItem
                icon="document-text"
                label="Terms of Service"
                color="#6b7280"
              />
              <MenuItem
                icon="information-circle"
                label="About SemmaAI"
                color="#8b5cf6"
              />
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.logoutGradient}
              >
                <Ionicons name="log-out" size={20} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>SemmaAI Version 1.0.0</Text>
            <Text style={styles.versionSubtext}>Made with ❤️ for Farmers</Text>
          </View>

          {/* Edit Modal */}
          <Modal
            visible={editModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      Edit {editField === 'name' ? 'Name' : editField === 'location' ? 'Location' : 'Crops'}
                    </Text>
                    <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[styles.modalInput, editField === 'crops' && styles.modalTextArea]}
                    value={editValue}
                    onChangeText={setEditValue}
                    placeholder={`Enter ${editField}`}
                    placeholderTextColor="#9ca3af"
                    multiline={editField === 'crops'}
                    numberOfLines={editField === 'crops' ? 4 : 1}
                  />

                  {editField === 'crops' && (
                    <View style={styles.cropSuggestions}>
                      <Text style={styles.suggestionTitle}>Popular crops:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {cropOptions.slice(0, 5).map((crop) => (
                          <TouchableOpacity
                            key={crop}
                            style={styles.cropChip}
                            onPress={() => {
                              const crops = editValue ? editValue.split(',').map(c => c.trim()) : [];
                              if (!crops.includes(crop)) {
                                setEditValue(crops.concat(crop).join(', '));
                              }
                            }}
                          >
                            <Text style={styles.cropChipText}>{crop}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      onPress={() => setEditModalVisible(false)}
                      style={styles.modalCancelButton}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveEdit}
                      style={styles.modalSaveButton}
                    >
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.modalSaveGradient}
                      >
                        <Text style={styles.modalSaveText}>Save Changes</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          {/* Language Modal */}
          <Modal
            visible={languageModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setLanguageModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Language</Text>
                    <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.languageList}>
                    {languages.map((lang) => (
                      <TouchableOpacity
                        key={lang.code}
                        onPress={() => handleLanguageChange(lang.code)}
                        style={[
                          styles.languageItem,
                          language === lang.code && styles.languageItemActive
                        ]}
                      >
                        <Text style={styles.languageFlag}>{lang.flag}</Text>
                        <Text style={[
                          styles.languageName,
                          language === lang.code && styles.languageNameActive
                        ]}>
                          {lang.name}
                        </Text>
                        {language === lang.code && (
                          <View style={styles.languageCheck}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profilePhone: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 12,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },

  // Quick Actions
  quickActionsContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  quickAction: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  editLink: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  menuValue: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },

  // Logout
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  versionSubtext: {
    color: '#d1d5db',
    fontSize: 11,
    marginTop: 4,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  cropSuggestions: {
    marginTop: 16,
  },
  suggestionTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  cropChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  cropChipText: {
    fontSize: 13,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Language Modal
  languageList: {
    marginTop: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  languageItemActive: {
    backgroundColor: '#dcfce7',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  languageNameActive: {
    color: '#047857',
    fontWeight: '600',
  },
  languageCheck: {
    marginLeft: 12,
  },
});

export default ProfileScreen;