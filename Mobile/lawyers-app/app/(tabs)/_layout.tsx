import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { fontWeight: '700', color: theme.text, fontSize: 18 },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.card },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0,
          // iOS shadow
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
          // Android shadow
          elevation: 12,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        sceneStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          tabBarLabel: 'Feed',
          headerTitle: 'Community Feed',
          headerStyle: { backgroundColor: '#0A2540' },
          headerTitleStyle: { color: '#FFFFFF' },

          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={(focused ? 'home' : 'home-outline') as IoniconsName}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='create'
        options={{
          tabBarLabel: 'Create',
          headerTitle: 'New Help Request',
          headerStyle: { backgroundColor: '#0A2540' },
          headerTitleStyle: { color: '#FFFFFF' },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                (focused ? 'add-circle' : 'add-circle-outline') as IoniconsName
              }
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='notifications'
        options={{
          tabBarLabel: 'Notifications',
          headerTitle: 'Notifications',
          headerStyle: { backgroundColor: '#0A2540' },
          headerTitleStyle: { color: '#FFFFFF' },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                (focused
                  ? 'notifications'
                  : 'notifications-outline') as IoniconsName
              }
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='two'
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'My Profile',
          headerStyle: { backgroundColor: '#0A2540' },
          headerTitleStyle: { color: '#FFFFFF' },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={(focused ? 'person' : 'person-outline') as IoniconsName}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
