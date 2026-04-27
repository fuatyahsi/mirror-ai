import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useI18n } from "@/i18n";
import { colors } from "@/theme";

export default function TabsLayout() {
  const { t } = useI18n();

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
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="coffee"
        options={{
          title: t("tabs.coffee"),
          tabBarIcon: ({ color, size }) => <Ionicons name="cafe-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="tarot"
        options={{
          title: t("tabs.tarot"),
          tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="relationship"
        options={{
          title: t("tabs.relationship"),
          tabBarIcon: ({ color, size }) => <Ionicons name="git-compare-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="astrology"
        options={{
          title: t("tabs.astrology"),
          tabBarIcon: ({ color, size }) => <Ionicons name="planet-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
