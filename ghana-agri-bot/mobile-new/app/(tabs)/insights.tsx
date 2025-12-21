import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  Animated,
  TouchableOpacity,
  ScrollView as RNScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { apiService } from '../../config/api';
import { useApp } from '../../context/AppContext';
import { BlurView } from 'expo-blur';

const { width: screenWidth } = Dimensions.get('window');

interface WeatherDay {
  day: string;
  temp: number;
  condition: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CropPrice {
  crop: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  price: number;
  change: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const AnimatedScrollView = Animated.ScrollView;

const InsightsScreen = () => {
  const { location } = useApp();
  const [weather, setWeather] = useState<{
    current: number;
    description: string;
    humidity: number;
    windSpeed: number;
    forecast: WeatherDay[];
  }>({
    current: 28,
    description: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    forecast: [],
  });
  const [topCrops, setTopCrops] = useState<CropPrice[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Persist animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInsights();

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
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);

      // Fetch weather (best-effort)
      try {
        const weatherData = await apiService.getWeather(location);
        if (weatherData?.summary) {
          const temp = weatherData.summary.match(/(\d+)°C/)?.[1];
          setWeather(prev => ({
            ...prev,
            current: temp ? parseInt(temp, 10) : prev.current,
            description: weatherData.summary.split('.')[0] || prev.description,
          }));
        }
      } catch (err) {
        console.warn('Weather fetch failed:', err);
      }

      // Mock/enhanced data
      setTopCrops([
        { crop: 'Maize', percentage: 85, trend: 'up', price: 2.8, change: 15.2 },
        { crop: 'Tomatoes', percentage: 72, trend: 'down', price: 5.2, change: -8.5 },
        { crop: 'Cassava', percentage: 65, trend: 'stable', price: 1.5, change: 0.5 },
        { crop: 'Rice', percentage: 58, trend: 'up', price: 4.0, change: 12.0 },
        { crop: 'Plantain', percentage: 45, trend: 'stable', price: 3.5, change: 2.0 },
      ]);

      setAlerts([
        {
          id: '1',
          type: 'danger',
          title: 'Pest Alert',
          message: 'Fall armyworm detected in Northern Region',
          icon: 'bug',
          color: '#ef4444',
        },
        {
          id: '2',
          type: 'info',
          title: 'Weather Update',
          message: 'Heavy rainfall expected next week',
          icon: 'rainy',
          color: '#3b82f6',
        },
        {
          id: '3',
          type: 'success',
          title: 'Market Opportunity',
          message: 'Tomato prices rising - good time to sell',
          icon: 'trending-up',
          color: '#10b981',
        },
      ]);

      setWeather(prev => ({
        ...prev,
        forecast: [
          { day: 'Mon', temp: 29, condition: 'Sunny', icon: 'sunny' },
          { day: 'Tue', temp: 27, condition: 'Cloudy', icon: 'partly-sunny' },
          { day: 'Wed', temp: 25, condition: 'Rainy', icon: 'rainy' },
          { day: 'Thu', temp: 30, condition: 'Sunny', icon: 'sunny' },
          { day: 'Fri', temp: 28, condition: 'Cloudy', icon: 'cloudy' },
        ],
      }));
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  // Charts data & config
  const priceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { data: [45, 65, 58, 80, 95, 88], color: (opacity = 1) => `rgba(16,185,129,${opacity})`, strokeWidth: 3 },
      { data: [30, 45, 40, 65, 75, 70], color: (opacity = 1) => `rgba(139,92,246,${opacity})`, strokeWidth: 3 },
    ],
  };

  const barChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{ data: [850, 920, 780, 1100] }],
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16,185,129,${opacity})`,
    labelColor: (opacity = 1) => `rgba(107,114,128,${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#fff' },
    propsForBackgroundLines: { strokeDasharray: '', stroke: '#e5e7eb', strokeWidth: 1 },
  };

  const barChartConfig = { ...chartConfig, color: (opacity = 1) => `rgba(139,92,246,${opacity})` };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Analyzing farm data...</Text>
      </View>
    );
  }

  const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    // stable animated value per card
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    useEffect(() => {
      Animated.timing(scaleAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
    }, [scaleAnim, delay]);

    return <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 12 }}>{children}</Animated.View>;
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <AnimatedScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" colors={['#10b981']} />}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <LinearGradient colors={['#10b981', '#059669']} style={styles.header}>
            <Text style={styles.headerTitle}>Farm Insights</Text>
            <Text style={styles.headerSubtitle}>Your agricultural intelligence dashboard</Text>
          </LinearGradient>

          {/* Weather Card */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <LinearGradient colors={['#3b82f6', '#2563eb', '#1d4ed8']} style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <View>
                  <Text style={styles.weatherLocation}>{location}</Text>
                  <View style={styles.weatherMain}>
                    <Text style={styles.weatherTemp}>{weather.current}°</Text>
                    <View style={styles.weatherDetails}>
                      <Text style={styles.weatherDesc}>{weather.description}</Text>
                      <View style={styles.weatherStats}>
                        <View style={styles.weatherStat}>
                          <Ionicons name="water" size={14} color="#93c5fd" />
                          <Text style={styles.weatherStatText}>{weather.humidity}%</Text>
                        </View>
                        <View style={styles.weatherStat}>
                          <Ionicons name="speedometer" size={14} color="#93c5fd" />
                          <Text style={styles.weatherStatText}>{weather.windSpeed}km/h</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.weatherIconContainer}>
                  <Ionicons name="partly-sunny" size={64} color="#fbbf24" />
                </View>
              </View>

              <BlurView intensity={20} tint="light" style={styles.forecastContainer}>
                {weather.forecast.map((day, index) => (
                  <TouchableOpacity key={index} style={styles.forecastItem} activeOpacity={0.8}>
                    <Text style={styles.forecastDay}>{day.day}</Text>
                    <Ionicons name={day.icon} size={28} color="#fff" />
                    <Text style={styles.forecastTemp}>{day.temp}°</Text>
                  </TouchableOpacity>
                ))}
              </BlurView>
            </LinearGradient>
          </Animated.View>

          {/* Alerts */}
          {alerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Alerts</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
              </View>

              {alerts.map((alert, index) => (
                <AnimatedCard key={alert.id} delay={index * 100}>
                  <TouchableOpacity style={styles.alertCard} activeOpacity={0.9}>
                    <LinearGradient colors={[`${alert.color}20`, `${alert.color}10`]} style={styles.alertGradient}>
                      <View style={[styles.alertIconBox, { backgroundColor: `${alert.color}20` }]}>
                        <Ionicons name={alert.icon} size={24} color={alert.color} />
                      </View>
                      <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <Text style={styles.alertMessage}>{alert.message}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </LinearGradient>
                  </TouchableOpacity>
                </AnimatedCard>
              ))}
            </View>
          )}

          {/* Market Performance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Performance</Text>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>This Week</Text>
                <Ionicons name="chevron-down" size={16} color="#10b981" />
              </TouchableOpacity>
            </View>

            <View style={styles.performanceCards}>
              <LinearGradient colors={['#dcfce7', '#bbf7d0']} style={styles.perfCard}>
                <Ionicons name="trending-up" size={24} color="#16a34a" />
                <Text style={styles.perfValue}>+24.5%</Text>
                <Text style={styles.perfLabel}>Revenue Growth</Text>
              </LinearGradient>

              <LinearGradient colors={['#fef3c7', '#fde68a']} style={styles.perfCard}>
                <Ionicons name="basket" size={24} color="#f59e0b" />
                <Text style={styles.perfValue}>1,250kg</Text>
                <Text style={styles.perfLabel}>Total Yield</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Top Crops */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Crops by Demand</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See More</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cropsContainer}>
              {topCrops.map((crop, index) => (
                <AnimatedCard key={index} delay={index * 50}>
                  <TouchableOpacity style={styles.cropCard} activeOpacity={0.9}>
                    <View style={styles.cropHeader}>
                      <View style={styles.cropInfo}>
                        <Text style={styles.cropName}>{crop.crop}</Text>
                        <Text style={styles.cropPrice}>GHS {crop.price}/kg</Text>
                      </View>
                      <View
                        style={[
                          styles.trendBadge,
                          { backgroundColor: crop.trend === 'up' ? '#dcfce7' : crop.trend === 'down' ? '#fee2e2' : '#f3f4f6' },
                        ]}
                      >
                        <Ionicons
                          name={crop.trend === 'up' ? 'trending-up' : crop.trend === 'down' ? 'trending-down' : 'remove'}
                          size={16}
                          color={crop.trend === 'up' ? '#16a34a' : crop.trend === 'down' ? '#ef4444' : '#6b7280'}
                        />
                        <Text
                          style={[
                            styles.trendText,
                            { color: crop.trend === 'up' ? '#16a34a' : crop.trend === 'down' ? '#ef4444' : '#6b7280' },
                          ]}
                        >
                          {crop.change > 0 ? '+' : ''}
                          {crop.change}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <LinearGradient colors={['#10b981', '#059669']} style={[styles.progressFill, { width: `${crop.percentage}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                      </View>
                      <Text style={styles.progressText}>{crop.percentage}% demand</Text>
                    </View>
                  </TouchableOpacity>
                </AnimatedCard>
              ))}
            </View>
          </View>

          {/* Price Trends Chart */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Price Trends</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Maize</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
                  <Text style={styles.legendText}>Tomatoes</Text>
                </View>
              </View>
            </View>

            <View style={styles.chartCard}>
              <LineChart data={priceChartData} width={screenWidth - 48} height={220} chartConfig={chartConfig} bezier style={styles.chart} withInnerLines withOuterLines withVerticalLabels withHorizontalLabels withDots withShadow={false} fromZero />
            </View>
          </View>

          {/* Weekly Sales */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weekly Sales</Text>
              <Text style={styles.chartTotal}>Total: GHS 3,650</Text>
            </View>

            <View style={styles.chartCard}>
              <BarChart data={barChartData} width={screenWidth - 48} height={200} chartConfig={barChartConfig} style={styles.chart} showBarTops withInnerLines fromZero yAxisLabel="GHS " yAxisSuffix="" />
            </View>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Smart Farming Tips</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>More Tips</Text>
              </TouchableOpacity>
            </View>

            <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              <TouchableOpacity style={styles.tipCard} activeOpacity={0.9}>
                <LinearGradient colors={['#dcfce7', '#bbf7d0']} style={styles.tipGradient}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="leaf" size={28} color="#16a34a" />
                  </View>
                  <Text style={styles.tipTitle}>Crop Rotation</Text>
                  <Text style={styles.tipText}>Rotate legumes with cereals to maintain soil nitrogen levels naturally</Text>
                  <TouchableOpacity style={styles.tipButton}>
                    <Text style={styles.tipButtonText}>Learn More</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipCard} activeOpacity={0.9}>
                <LinearGradient colors={['#dbeafe', '#bfdbfe']} style={styles.tipGradient}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="water" size={28} color="#3b82f6" />
                  </View>
                  <Text style={styles.tipTitle}>Water Management</Text>
                  <Text style={styles.tipText}>Install drip irrigation to save 40% water and increase yield by 20%</Text>
                  <TouchableOpacity style={styles.tipButton}>
                    <Text style={styles.tipButtonText}>Learn More</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tipCard} activeOpacity={0.9}>
                <LinearGradient colors={['#fef3c7', '#fde68a']} style={styles.tipGradient}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="sunny" size={28} color="#f59e0b" />
                  </View>
                  <Text style={styles.tipTitle}>Solar Power</Text>
                  <Text style={styles.tipText}>Use solar pumps for irrigation to reduce energy costs by 60%</Text>
                  <TouchableOpacity style={styles.tipButton}>
                    <Text style={styles.tipButtonText}>Learn More</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            </RNScrollView>
          </View>

          <View style={{ height: 100 }} />
        </AnimatedScrollView>
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },

  // Weather Card
  weatherCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  weatherLocation: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 4,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherTemp: {
    color: '#fff',
    fontSize: 52,
    fontWeight: 'bold',
    marginRight: 16,
  },
  weatherDetails: {
    justifyContent: 'center',
  },
  weatherDesc: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  weatherStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  weatherStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  weatherStatText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginLeft: 6,
  },
  weatherIconContainer: {
    justifyContent: 'center',
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },
  forecastItem: {
    alignItems: 'center',
    flex: 1,
  },
  forecastDay: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  forecastTemp: {
    color: '#fff',
    fontSize: 14,
    marginTop: 6,
    fontWeight: 'bold',
  },

  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
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
  seeAll: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginRight: 6,
  },

  // Alerts
  alertCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  alertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  alertIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    color: '#6b7280',
  },

  // Performance Cards
  performanceCards: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  perfCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  perfValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  perfLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  // Crops
  cropsContainer: {
    marginTop: 8,
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cropPrice: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
  },

  // Charts
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chart: {
    borderRadius: 16,
    marginLeft: -8,
  },
  legendContainer: {
    flexDirection: 'row',
    marginLeft: -6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  chartTotal: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },

  // Tips
  tipCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 16,
  },
  tipGradient: {
    padding: 16,
    borderRadius: 16,
    height: 180,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    flex: 1,
  },
  tipButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tipButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});

export default InsightsScreen;
