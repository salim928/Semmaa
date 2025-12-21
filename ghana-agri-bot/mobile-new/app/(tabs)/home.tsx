import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../config/api';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface WeatherData {
  temperature?: number;
  description?: string;
  humidity?: number;
  windSpeed?: number;
}

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { location, setLocation, language, setLanguage } = useApp();
  const [weather, setWeather] = useState<WeatherData>({});
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [specificLocation, setSpecificLocation] = useState('Ghana');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Persist animated values across renders
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Compute a safe status bar height
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

  useEffect(() => {
    updateGreeting();
    getLocationPermission();
    fetchWeather();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const getLocationPermission = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location to get weather for your specific area',
          [{ text: 'OK' }]
        );
        setSpecificLocation('Ghana');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get city/town name
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Set specific location (city/town)
      const locationName = address.city || address.district || address.subregion || address.region || 'Ghana';
      setSpecificLocation(locationName);
      
      // Update global location context
      if (setLocation) {
        setLocation(locationName);
      }

      // Fetch weather for specific location
      fetchWeather(locationName);
    } catch (error) {
      console.error('Location error:', error);
      setSpecificLocation('Ghana');
    } finally {
      setLoadingLocation(false);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const fetchWeather = async (locationName?: string) => {
    try {
      const weatherLocation = locationName || specificLocation || location;
      const response = await apiService.getWeather(weatherLocation);
      if (response?.summary) {
        const temp = response.summary.match(/(\d+)°C/)?.[1];
        setWeather({
          temperature: temp ? parseInt(temp, 10) : 28,
          description: response.summary.split('.')[0] || 'Partly Cloudy',
          humidity: 75,
          windSpeed: 12,
        });
      } else {
        setWeather({
          temperature: 28,
          description: 'Partly Cloudy',
          humidity: 75,
          windSpeed: 12,
        });
      }
    } catch (error) {
      console.error('Weather fetch failed:', error);
      setWeather({
        temperature: 28,
        description: 'Partly Cloudy',
        humidity: 75,
        windSpeed: 12,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocationPermission();
    await fetchWeather();
    updateGreeting();
    setRefreshing(false);
  };

  const handleCardPress = (screen: string) => {
    switch (screen) {
      case 'marketplace':
        router.push('/market');
        break;
      case 'wallet':
        router.push('/wallet');
        break;
      case 'insights':
        router.push('/insights');
        break;
      case 'ChatScreen':
        router.push('/ChatScreen');
        break;
      case 'weather':
        router.push('/weather');
        break;
      case 'crops':
        router.push('/crops');
        break;
      case 'calendar':
        router.push('/tools/planting-calendar');
        break;
      case 'community':
        router.push('/Community');
        break;
      default:
        break;
    }
  };

  const headerScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const QuickActionCard = ({
    icon,
    title,
    subtitle,
    screen,
    gradient,
    delay = 0,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    screen: string;
    gradient: string[];
    delay?: number;
  }) => {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim, delay]);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], flexBasis: '48%' }}>
        <TouchableOpacity
          onPress={() => handleCardPress(screen)}
          activeOpacity={0.9}
          style={styles.quickActionCard}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickActionGradient}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name={icon} size={28} color="#fff" />
            </View>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ServiceCard = ({
    icon,
    title,
    description,
    value,
    screen,
    color,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    value?: string;
    screen: string;
    color: string;
  }) => (
    <TouchableOpacity
      onPress={() => handleCardPress(screen)}
      style={styles.serviceCard}
      activeOpacity={0.95}
    >
      <View style={styles.serviceCardHeader}>
        <View style={[styles.serviceIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
      <Text style={styles.serviceCardTitle}>{title}</Text>
      <Text style={styles.serviceCardDescription}>{description}</Text>
      {value && (
        <View style={styles.serviceCardValue}>
          <Text style={[styles.serviceCardValueText, { color }]}>{value}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" colors={['#10b981']} />
          }
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
        >
          {/* Animated Header */}
          <Animated.View style={{ transform: [{ scale: headerScale }], opacity: fadeAnim }}>
            <LinearGradient
              colors={['#10b981', '#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.header, { paddingTop: statusBarHeight + 10 }]}
            >
              <View style={styles.headerPattern}>
                {[...Array(6)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.patternCircle,
                      {
                        left: `${i * 20}%`,
                        top: `${Math.sin(i) * 30 + 50}%`,
                        opacity: Math.max(0.02, 0.1 - i * 0.01),
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.headerContent}>
                <View style={styles.profileSection}>
                  <TouchableOpacity style={styles.profileLeft} activeOpacity={0.8}>
                    <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.avatar}>
                      <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'F'}</Text>
                    </LinearGradient>
                    <View style={styles.greetingContainer}>
                      <Text style={styles.greetingText}>{greeting || 'Welcome'} 👋</Text>
                      <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Farmer'}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerActionBtn}>
                      <Ionicons name="search-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerActionBtn}>
                      <Ionicons name="notifications-outline" size={22} color="#fff" />
                      <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.languagePill}
                      onPress={() => {
                        // Simple toggle between English and Twi placeholder
                        const next = language === 'en' ? 'tw' : 'en';
                        setLanguage?.(next);
                      }}
                    >
                      <Text style={styles.languagePillText}>
                        {language === 'en' ? 'EN' : language?.toUpperCase?.() || 'EN'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <BlurView intensity={20} tint="light" style={styles.weatherCard}>
                  <View style={styles.weatherContent}>
                    <View style={styles.weatherLeft}>
                      <View style={styles.weatherIconContainer}>
                        <Ionicons name="partly-sunny" size={36} color="#fbbf24" />
                      </View>
                      <View style={styles.weatherInfo}>
                        <Text style={styles.weatherTemp}>{weather.temperature || 28}°</Text>
                        <Text style={styles.weatherDesc}>{weather.description || 'Partly Cloudy'}</Text>
                      </View>
                    </View>
                    <View style={styles.weatherRight}>
                      <View style={styles.weatherStat}>
                        <Ionicons name="water" size={16} color="#60a5fa" />
                        <Text style={styles.weatherStatText}>{weather.humidity || 75}%</Text>
                      </View>
                      <View style={styles.weatherStat}>
                        <Ionicons name="speedometer" size={16} color="#fff" />
                        <Text style={styles.weatherStatText}>{weather.windSpeed || 12}km/h</Text>
                      </View>
                      <TouchableOpacity style={styles.weatherMoreBtn}>
                        <Text style={styles.weatherMoreText}>Details</Text>
                        <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>

                <TouchableOpacity 
                  style={styles.locationContainer}
                  onPress={getLocationPermission}
                  activeOpacity={0.8}
                >
                  <View style={styles.locationBadge}>
                    {loadingLocation ? (
                      <>
                        <Text style={styles.locationText}>Detecting location...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="location" size={14} color="#10b981" />
                        <Text style={styles.locationText}>{specificLocation}</Text>
                        <TouchableOpacity onPress={getLocationPermission}>
                          <Ionicons name="refresh" size={14} color="#10b981" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions Grid */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <QuickActionCard icon="chatbubbles" title="AI Advisor" subtitle="Get help" screen="ChatScreen" gradient={['#8b5cf6', '#7c3aed']} delay={0} />
              <QuickActionCard icon="trending-up" title="Market" subtitle="View prices" screen="marketplace" gradient={['#ec4899', '#db2777']} delay={100} />
              <QuickActionCard icon="wallet" title="Wallet" subtitle="Track money" screen="wallet" gradient={['#3b82f6', '#2563eb']} delay={200} />
              <QuickActionCard icon="leaf" title="My Crops" subtitle="3 Active" screen="crops" gradient={['#10b981', '#059669']} delay={300} />
            </View>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Today's Overview</Text>
                <TouchableOpacity>
                  <Text style={styles.statsViewAll}>View All →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                    <Ionicons name="leaf" size={20} color="#16a34a" />
                  </View>
                  <Text style={styles.statValue}>92%</Text>
                  <Text style={styles.statLabel}>Crop Health</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                    <Ionicons name="sunny" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.statValue}>Good</Text>
                  <Text style={styles.statLabel}>Weather</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="water" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.statValue}>65%</Text>
                  <Text style={styles.statLabel}>Soil Moisture</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#fce7f3' }]}>
                    <Ionicons name="alert-circle" size={20} color="#ec4899" />
                  </View>
                  <Text style={styles.statValue}>2</Text>
                  <Text style={styles.statLabel}>Alerts</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Services Section */}
          <View style={styles.servicesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Farm Services</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
              <ServiceCard icon="analytics" title="Farm Insights" description="Performance metrics" value="+12%" screen="insights" color="#10b981" />
              <ServiceCard icon="calendar" title="Planting Calendar" description="Ghana crop seasons" value="Season guide" screen="calendar" color="#8b5cf6" />
              <ServiceCard icon="people" title="Community" description="Connect with farmers" value="5 groups" screen="community" color="#ec4899" />
            </ScrollView>
          </View>

          {/* Daily Tip */}
          <View style={styles.tipContainer}>
            <LinearGradient colors={['#fef3c7', '#fde68a']} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={styles.tipBadge}>
                  <Text style={styles.tipBadgeText}>💡 DAILY TIP</Text>
                </View>
                <TouchableOpacity style={styles.tipCloseBtn}>
                  <Ionicons name="close" size={18} color="#92400e" />
                </TouchableOpacity>
              </View>

              <Text style={styles.tipTitle}>Boost Your Harvest</Text>
              <Text style={styles.tipText}>
                Apply organic mulch around your plants to retain moisture during dry periods. This can increase water retention by up to 70% and suppress weeds naturally.
              </Text>

              <TouchableOpacity style={styles.tipButton} activeOpacity={0.9}>
                <Text style={styles.tipButtonText}>Learn More</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity style={[styles.activityCard, { marginBottom: 12 }]}>
                <View style={[styles.activityIcon, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="chatbubble" size={20} color="#16a34a" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>AI Advisory</Text>
                  <Text style={styles.activityText}>Asked about fertilizer timing</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.activityCard, { marginBottom: 12 }]}>
                <View style={[styles.activityIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="pricetag" size={20} color="#3b82f6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Market Check</Text>
                  <Text style={styles.activityText}>Viewed maize prices</Text>
                  <Text style={styles.activityTime}>5 hours ago</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.activityCard, { marginBottom: 12 }]}>
                <View style={[styles.activityIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="warning" size={20} color="#ef4444" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Weather Alert</Text>
                  <Text style={styles.activityText}>Heavy rain expected tomorrow</Text>
                  <Text style={styles.activityTime}>1 day ago</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },
  languagePill: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  languagePillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Weather Card
  weatherCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIconContainer: {
    marginRight: 12,
  },
  weatherInfo: {},
  weatherTemp: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  weatherDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  weatherStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  weatherStatText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 6,
  },
  weatherMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weatherMoreText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 2,
  },

  // Location
  locationContainer: {
    alignItems: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  quickActionCard: {
    flexBasis: '48%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    margin: 6,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },

  // Stats Container
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
  },
  statsViewAll: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
  },

  // Services Section
  servicesSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAll: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  servicesScroll: {
    paddingHorizontal: 20,
  },
  serviceCard: {
    width: width * 0.42,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  serviceCardDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  serviceCardValue: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  serviceCardValueText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Tip Card
  tipContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  tipCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
  },
  tipCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(146,64,14,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Activity Section
  activitySection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
});

export default HomeScreen;