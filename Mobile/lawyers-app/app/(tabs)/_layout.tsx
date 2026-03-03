import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { fontWeight: "700", color: "#0f274d", fontSize: 22 },
        headerShadowVisible: false,
        tabBarActiveTintColor: "#1d4ed8",
        tabBarInactiveTintColor: "#7b8dad",
        tabBarStyle: {
          position: "absolute",
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 16,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          backgroundColor: "#ffffff",
          shadowColor: "#102a56",
          shadowOpacity: 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        sceneStyle: {
          backgroundColor: "#f4f7fc",
        },
        headerStyle: {
          backgroundColor: "#f4f7fc",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarLabel: "Feed",
          headerTitle: "Community",
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "New Post",
          tabBarLabel: "Create",
          headerTitle: "Create Request",
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "My Profile",
          tabBarLabel: "Profile",
          headerTitle: "My Profile",
        }}
      />
    </Tabs>
  );
}
