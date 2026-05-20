import { Tabs } from "expo-router";
import { StyleSheet, Text as RNText, View } from "react-native";
import FloatingChatBubble from "../../components/FloatingChatBubble";
import { useCartStore } from "../../store/cartStore";

// ─── Cart badge overlay on tab icon ──────────────────────────────────────────

function CartBadge() {
  const count = useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty, 0));
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <RNText style={styles.badgeText}>{count > 99 ? "99+" : count}</RNText>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#7C3AED",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            height: 78,
            paddingTop: 8,
            paddingBottom: 18,
          },
          tabBarItemStyle: {
            flex: 1, // force even distribution across both tabs
            justifyContent: "center",
          },
          tabBarLabelStyle: {
            fontFamily: "InterSemiBold",
            fontSize: 11,
            fontWeight: "700",
            marginTop: 2,
          },
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#0F0F12",
          headerTitleStyle: {
            fontFamily: "InterExtraBold",
            fontSize: 18,
            fontWeight: "800",
          },
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="menu"
          options={{
            title: "Menu",
            tabBarLabel: "Menu",
            tabBarIcon: ({ color, focused }) => (
              <RNText style={{ color, fontSize: focused ? 24 : 22 }}>🍽</RNText>
            ),
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: "Your Tab",
            tabBarLabel: "Tab",
            tabBarIcon: ({ color, focused }) => (
              <View>
                <RNText style={{ color, fontSize: focused ? 24 : 22 }}>🧾</RNText>
                <CartBadge />
              </View>
            ),
          }}
        />
      </Tabs>

      <FloatingChatBubble />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    fontFamily: "InterExtraBold",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
