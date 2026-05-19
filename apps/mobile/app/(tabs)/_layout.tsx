import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useCartStore } from "../../store/cart";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text className={`text-2xl ${focused ? "opacity-100" : "opacity-40"}`}>{name}</Text>
  );
}

export default function TabLayout() {
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#141414",
          borderTopColor: "#242424",
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#d4af37",
        tabBarInactiveTintColor: "#888888",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "MENU",
          tabBarIcon: ({ focused }) => <TabIcon name="🍽" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "CART",
          tabBarIcon: ({ focused }) => <TabIcon name="🛒" focused={focused} />,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#d4af37", color: "#0a0a0a", fontSize: 10, fontWeight: "700" },
        }}
      />
    </Tabs>
  );
}
