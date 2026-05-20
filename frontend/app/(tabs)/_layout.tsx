import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCartStore } from "../../store/cartStore";

// ─── Cart badge overlay on tab icon ──────────────────────────────────────────

function CartBadge() {
  const count = useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty, 0));
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

// ─── Cart pill in Order tab header ───────────────────────────────────────────

function CartHeaderButton() {
  const router = useRouter();
  const count = useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty, 0));
  if (count === 0) return null;
  return (
    <TouchableOpacity
      style={styles.headerPill}
      onPress={() => router.push("/(tabs)/cart")}
    >
      <Text style={styles.headerPillText}>🛒 {count}</Text>
    </TouchableOpacity>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

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
          headerRight: () => <CartHeaderButton />,
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  headerPill: {
    marginRight: 14,
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerPillText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
});
