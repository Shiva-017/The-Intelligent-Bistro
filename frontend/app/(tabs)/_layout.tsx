import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useCartStore } from "../../store/cartStore";

function CartBadge() {
  const count = useCartStore(
    (s) => s.items.reduce((acc, i) => acc + i.qty, 0)
  );
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#FAFAF8",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
        },
        headerStyle: { backgroundColor: "#FAFAF8" },
        headerTintColor: "#1a1a1a",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarLabel: "Menu",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🍽</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Order",
          tabBarLabel: "Order",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>💬</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarLabel: "Cart",
          tabBarIcon: ({ color }) => (
            <View>
              <Text style={{ color, fontSize: 20 }}>🛒</Text>
              <CartBadge />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
