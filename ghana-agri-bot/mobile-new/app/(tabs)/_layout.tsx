//app/(tabs)/_layout

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Custom tab bar icon with label only shown when focused
const TabIcon = ({ 
  name, 
  iconName, 
  color, 
  focused 
}: { 
  name: string; 
  iconName: keyof typeof Ionicons.glyphMap; 
  color: string; 
  focused: boolean;
}) => (
  <View style={styles.tabItem}>
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Ionicons name={iconName} size={22} color={focused ? '#fff' : color} />
    </View>
    {focused && <Text style={styles.tabLabel}>{name}</Text>}
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#006400',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          paddingTop: 10,
          paddingBottom: 10,
          marginBottom: 20,
          marginHorizontal: 16,
          borderRadius: 35,
          position: 'absolute',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Home" iconName="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Insights" iconName="analytics" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Market" iconName="storefront" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Profile" iconName="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#006400',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#006400',
    marginTop: 2,
  },
});