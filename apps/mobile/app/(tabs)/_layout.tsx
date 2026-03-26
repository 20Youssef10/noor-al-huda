import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { theme } from '../../src/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.goldLight,
        tabBarInactiveTintColor: theme.colors.creamFaint,
        tabBarStyle: {
          backgroundColor: '#17110B',
          borderTopColor: 'rgba(201,168,76,0.12)',
          height: 74,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.bodyBold,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'القرآن',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'الصلاة',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="mosque-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="azkar"
        options={{
          title: 'الأذكار',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hands-pray" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="radio"
        options={{
          title: 'الإذاعة',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="radio" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
