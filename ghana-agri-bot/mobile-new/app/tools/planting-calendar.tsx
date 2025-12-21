// app/PlantingCalendar.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

// Ghana's agricultural regions
const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong Ahafo',
];

// Ghana's planting seasons
const SEASONS = {
  'Major Rainy': { months: 'March - July', color: '#3b82f6' },
  'Minor Rainy': { months: 'September - November', color: '#10b981' },
  'Dry Season': { months: 'December - February', color: '#f59e0b' },
};

// Crop planting data for Ghana
const CROP_CALENDAR = {
  'Maize': {
    'Southern Ghana': {
      'Major Rainy': { plant: 'March-April', harvest: 'July-August', best: true },
      'Minor Rainy': { plant: 'September', harvest: 'December', best: false },
    },
    'Northern Ghana': {
      'Major Rainy': { plant: 'May-June', harvest: 'September-October', best: true },
    },
  },
  'Cassava': {
    'All Regions': {
      'Major Rainy': { plant: 'April-May', harvest: '12-18 months later', best: true },
      'Minor Rainy': { plant: 'October', harvest: '12-18 months later', best: false },
    },
  },
  'Tomatoes': {
    'Southern Ghana': {
      'Dry Season': { plant: 'November-December', harvest: 'February-March', best: true },
      'Minor Rainy': { plant: 'August-September', harvest: 'November-December', best: false },
    },
  },
  'Rice': {
    'Volta Region': {
      'Major Rainy': { plant: 'April-May', harvest: 'August-September', best: true },
    },
    'Northern Ghana': {
      'Major Rainy': { plant: 'June-July', harvest: 'October-November', best: true },
    },
  },
  'Plantain': {
    'Forest Zones': {
      'Major Rainy': { plant: 'March-May', harvest: '9-12 months later', best: true },
      'Minor Rainy': { plant: 'September-October', harvest: '9-12 months later', best: false },
    },
  },
  'Cocoa': {
    'Western/Ashanti': {
      'Major Rainy': { plant: 'April-June', harvest: 'Oct-Mar (main), May-Aug (light)', best: true },
    },
  },
  'Groundnuts': {
    'Northern Ghana': {
      'Major Rainy': { plant: 'June-July', harvest: 'September-October', best: true },
    },
  },
  'Yam': {
    'Middle Belt': {
      'Major Rainy': { plant: 'March-April', harvest: 'November-December', best: true },
    },
  },
};

const PlantingCalendarScreen = () => {
  const router = useRouter();
  const { location } = useApp();
  const [selectedRegion, setSelectedRegion] = useState('Southern Ghana');
  const [selectedCrop, setSelectedCrop] = useState('Maize');
  const [currentMonth, setCurrentMonth] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Get current month
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    setCurrentMonth(months[new Date().getMonth()]);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Auto-detect region based on location
    detectRegion();
  }, []);

  const detectRegion = () => {
    // Map specific locations to regions
    if (location?.toLowerCase().includes('accra')) {
      setSelectedRegion('Southern Ghana');
    } else if (location?.toLowerCase().includes('kumasi') || location?.toLowerCase().includes('obuasi')) {
      setSelectedRegion('Southern Ghana');
    } else if (location?.toLowerCase().includes('tamale')) {
      setSelectedRegion('Northern Ghana');
    }
    // Add more mappings as needed
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 6) return 'Major Rainy';
    if (month >= 8 && month <= 10) return 'Minor Rainy';
    return 'Dry Season';
  };

  const CropCard = ({ crop, data }: { crop: string; data: any }) => {
    const regionData = data[selectedRegion] || data['All Regions'] || data['Forest Zones'] || data['Middle Belt'];
    if (!regionData) return null;

    return (
      <TouchableOpacity style={styles.cropCard} activeOpacity={0.9}>
        <View style={styles.cropHeader}>
          <View style={styles.cropIconContainer}>
            <Ionicons name="leaf" size={24} color="#10b981" />
          </View>
          <View style={styles.cropInfo}>
            <Text style={styles.cropName}>{crop}</Text>
            <Text style={styles.cropRegion}>{selectedRegion}</Text>
          </View>
        </View>

        {Object.entries(regionData).map(([season, info]: [string, any]) => (
          <View key={season} style={styles.seasonInfo}>
            <View style={[styles.seasonBadge, { backgroundColor: SEASONS[season as keyof typeof SEASONS]?.color + '20' }]}>
              <Text style={[styles.seasonBadgeText, { color: SEASONS[season as keyof typeof SEASONS]?.color }]}>
                {season}
              </Text>
              {info.best && (
                <View style={styles.bestBadge}>
                  <Text style={styles.bestText}>BEST</Text>
                </View>
              )}
            </View>
            <View style={styles.timingInfo}>
              <View style={styles.timingRow}>
                <Ionicons name="flower" size={14} color="#10b981" />
                <Text style={styles.timingLabel}>Plant:</Text>
                <Text style={styles.timingValue}>{info.plant}</Text>
              </View>
              <View style={styles.timingRow}>
                <Ionicons name="basket" size={14} color="#f59e0b" />
                <Text style={styles.timingLabel}>Harvest:</Text>
                <Text style={styles.timingValue}>{info.harvest}</Text>
              </View>
            </View>
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  const MonthCard = ({ month, isActive }: { month: string; isActive: boolean }) => (
    <View style={[styles.monthCard, isActive && styles.monthCardActive]}>
      <Text style={[styles.monthText, isActive && styles.monthTextActive]}>{month.slice(0, 3)}</Text>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Planting Calendar</Text>
              <Text style={styles.headerSubtitle}>Ghana Agricultural Seasons</Text>
              
              <View style={styles.currentSeasonBadge}>
                <Ionicons name="calendar" size={16} color="#fff" />
                <Text style={styles.currentSeasonText}>
                  Current: {getCurrentSeason()} Season
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Year Timeline */}
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>2025 Planting Timeline</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthsScroll}
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                <MonthCard 
                  key={month} 
                  month={month} 
                  isActive={currentMonth.startsWith(month)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Season Overview */}
          <View style={styles.seasonOverview}>
            <Text style={styles.sectionTitle}>Seasonal Guide</Text>
            <View style={styles.seasonsGrid}>
              {Object.entries(SEASONS).map(([name, data]) => (
                <TouchableOpacity 
                  key={name} 
                  style={[styles.seasonCard, { borderColor: data.color }]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.seasonDot, { backgroundColor: data.color }]} />
                  <Text style={styles.seasonName}>{name}</Text>
                  <Text style={styles.seasonMonths}>{data.months}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Region Selector */}
          <View style={styles.regionSection}>
            <Text style={styles.sectionTitle}>Select Your Region</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.regionsScroll}
            >
              {['Southern Ghana', 'Northern Ghana', 'Volta Region', 'Forest Zones', 'Middle Belt'].map((region) => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionChip,
                    selectedRegion === region && styles.regionChipActive
                  ]}
                  onPress={() => setSelectedRegion(region)}
                >
                  <Text style={[
                    styles.regionChipText,
                    selectedRegion === region && styles.regionChipTextActive
                  ]}>
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Crop Planting Schedule */}
          <View style={styles.scheduleSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Crop Planting Schedule</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Filter</Text>
              </TouchableOpacity>
            </View>

            {Object.entries(CROP_CALENDAR).map(([crop, data]) => (
              <CropCard key={crop} crop={crop} data={data} />
            ))}
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <LinearGradient
              colors={['#fef3c7', '#fde68a']}
              style={styles.tipCard}
            >
              <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={24} color="#f59e0b" />
                <Text style={styles.tipTitle}>Regional Tip</Text>
              </View>
              <Text style={styles.tipText}>
                In {selectedRegion}, the best planting time for most crops is during the major rainy season. 
                Ensure proper land preparation before the rains begin for optimal yields.
              </Text>
            </LinearGradient>
          </View>

          {/* Weather Alert */}
          <View style={styles.alertSection}>
            <LinearGradient
              colors={['#dbeafe', '#bfdbfe']}
              style={styles.alertCard}
            >
              <Ionicons name="alert-circle" size={20} color="#3b82f6" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Weather Advisory</Text>
                <Text style={styles.alertText}>
                  Check local weather forecasts before planting. Climate patterns may vary slightly each year.
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 12,
  },
  currentSeasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  currentSeasonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Timeline
  timelineContainer: {
    padding: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  monthsScroll: {
    gap: 8,
  },
  monthCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  monthCardActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  monthTextActive: {
    color: '#fff',
  },
  
  // Season Overview
  seasonOverview: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  seasonsGrid: {
    gap: 12,
  },
  seasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
  },
  seasonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  seasonName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  seasonMonths: {
    fontSize: 13,
    color: '#6b7280',
  },
  
  // Region Section
  regionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  regionsScroll: {
    gap: 8,
  },
  regionChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  regionChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  regionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  regionChipTextActive: {
    color: '#fff',
  },
  
  // Schedule Section
  scheduleSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Crop Cards
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  cropRegion: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  seasonInfo: {
    marginTop: 12,
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  seasonBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bestBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  bestText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  timingInfo: {
    gap: 6,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timingLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  timingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Tips
  tipsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  tipText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  
  // Alert
  alertSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 13,
    color: '#3730a3',
    lineHeight: 18,
  },
});

export default PlantingCalendarScreen;