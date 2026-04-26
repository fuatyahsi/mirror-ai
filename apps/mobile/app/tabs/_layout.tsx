import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Ana",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="coffee"
        options={{
          title: "Kahve",
          tabBarIcon: ({ color, size }) => <Ionicons name="cafe-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="tarot"
        options={{
          title: "Tarot",
          tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="relationship"
        options={{
          title: "İlişki",
          tabBarIcon: ({ color, size }) => <Ionicons name="git-compare-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}

