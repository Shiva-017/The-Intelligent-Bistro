import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { XStack, YStack } from "tamagui";
import { CartItem, useCartStore } from "../../store/cartStore";

const C = {
  ink: "#0F0F12",
  inkSoft: "#3F3F46",
  inkMuted: "#6B7280",
  primary: "#7C3AED",
  primarySoft: "#EDE9FE",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFAF8",
  hairline: "#E5E7EB",
  chip: "#F3F4F6",
} as const;

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCart() {
  const router = useRouter();
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBubble}>
        <RNText style={{ fontSize: 48 }}>🍽</RNText>
      </View>
      <RNText style={styles.emptyTitle}>Your table is set</RNText>
      <RNText style={styles.emptyHelp}>
        Browse the menu, or call your waiter — I'll add things to your tab as we chat.
      </RNText>
      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => router.push("/(tabs)/menu")}
        activeOpacity={0.85}
      >
        <RNText style={styles.startBtnText}>Browse the Menu</RNText>
      </TouchableOpacity>
    </View>
  );
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function CartRow({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: {
  item: CartItem;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.row}>
      <YStack flex={1}>
        <RNText style={styles.itemName}>{item.name}</RNText>
        <RNText style={styles.itemPrice}>${item.price.toFixed(2)} each</RNText>
      </YStack>
      <XStack alignItems="center" gap={2}>
        <TouchableOpacity style={styles.qtyBtn} onPress={onDecrement} activeOpacity={0.7}>
          <RNText style={styles.qtyBtnText}>−</RNText>
        </TouchableOpacity>
        <RNText style={styles.qtyValue}>{item.qty}</RNText>
        <TouchableOpacity
          style={[styles.qtyBtn, styles.qtyBtnPlus]}
          onPress={onIncrement}
          activeOpacity={0.7}
        >
          <RNText style={styles.qtyBtnPlusText}>+</RNText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.6}>
          <RNText style={{ fontSize: 16 }}>🗑</RNText>
        </TouchableOpacity>
      </XStack>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CartScreen() {
  const { items, addItem, removeItem, updateQty, clearCart, totalPrice } =
    useCartStore();

  if (items.length === 0) return <EmptyCart />;

  function handlePlaceOrder() {
    Alert.alert("Send to the kitchen?", "We'll start preparing your order right away.", [
      { text: "Not yet", style: "cancel" },
      {
        text: "Send it",
        onPress: () => {
          clearCart();
          Alert.alert(
            "Order placed! 🎉",
            "Your food will be ready in about 20 minutes. Enjoy!"
          );
        },
      },
    ]);
  }

  const itemCount = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <RNText style={styles.listHeaderTitle}>Your Tab</RNText>
            <RNText style={styles.listHeaderSub}>
              {itemCount} {itemCount === 1 ? "item" : "items"} ready to send to the kitchen
            </RNText>
          </View>
        }
        renderItem={({ item }) => (
          <CartRow
            item={item}
            onDecrement={() => updateQty(item.id, item.qty - 1)}
            onIncrement={() => addItem({ ...item, qty: 1 })}
            onRemove={() => removeItem(item.id)}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <RNText style={styles.footerMeta}>Items</RNText>
              <RNText style={styles.footerMetaValue}>{itemCount}</RNText>
            </View>
            <View style={styles.footerRow}>
              <RNText style={styles.footerMeta}>Subtotal</RNText>
              <RNText style={styles.footerMetaValue}>${totalPrice().toFixed(2)}</RNText>
            </View>
            <View style={styles.divider} />
            <View style={styles.footerRow}>
              <RNText style={styles.totalLabel}>Total</RNText>
              <RNText style={styles.totalAmount}>${totalPrice().toFixed(2)}</RNText>
            </View>
            <TouchableOpacity
              style={styles.placeOrderBtn}
              onPress={handlePlaceOrder}
              activeOpacity={0.88}
            >
              <RNText style={styles.placeOrderText}>Send to the Kitchen 🍳</RNText>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surfaceAlt },
  listContent: { paddingBottom: 32 },

  // empty
  emptyContainer: {
    flex: 1,
    backgroundColor: C.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconBubble: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: "InterExtraBold",
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    marginTop: 20,
  },
  emptyHelp: {
    fontFamily: "Inter",
    fontSize: 14.5,
    color: C.inkMuted,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 21,
  },
  startBtn: {
    marginTop: 28,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingHorizontal: 34,
    paddingVertical: 15,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 5,
  },
  startBtnText: {
    fontFamily: "InterExtraBold",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // list header
  listHeader: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  listHeaderTitle: {
    fontFamily: "InterExtraBold",
    fontSize: 26,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.5,
  },
  listHeaderSub: {
    fontFamily: "Inter",
    fontSize: 13.5,
    color: C.inkMuted,
    marginTop: 3,
    fontStyle: "italic",
  },

  // row
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    marginHorizontal: 14,
    marginVertical: 5,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.hairline,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  itemName: {
    fontFamily: "InterBold",
    fontSize: 15.5,
    fontWeight: "800",
    color: C.ink,
  },
  itemPrice: {
    fontFamily: "Inter",
    fontSize: 12.5,
    color: C.inkMuted,
    marginTop: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontFamily: "InterExtraBold",
    fontSize: 18,
    color: C.inkSoft,
    fontWeight: "800",
  },
  qtyBtnPlus: {
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyBtnPlusText: {
    fontFamily: "InterExtraBold",
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  qtyValue: {
    fontFamily: "InterBold",
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    width: 34,
    textAlign: "center",
  },
  removeBtn: { marginLeft: 8, padding: 6 },

  // footer
  footer: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 32,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.hairline,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  footerMeta: { fontFamily: "Inter", color: C.inkMuted, fontSize: 14 },
  footerMetaValue: {
    fontFamily: "InterSemiBold",
    color: C.inkSoft,
    fontSize: 14,
    fontWeight: "700",
  },
  divider: { height: 1, backgroundColor: C.chip, marginVertical: 12 },
  totalLabel: {
    fontFamily: "InterExtraBold",
    fontSize: 19,
    fontWeight: "800",
    color: C.ink,
  },
  totalAmount: {
    fontFamily: "InterExtraBold",
    fontSize: 22,
    fontWeight: "800",
    color: C.primary,
  },
  placeOrderBtn: {
    marginTop: 18,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 5,
  },
  placeOrderText: {
    fontFamily: "InterExtraBold",
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "800",
  },
});
