import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCartStore, CartItem } from "../../store/cartStore";

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCart() {
  const router = useRouter();
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🛒</Text>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => router.push("/(tabs)/order")}
      >
        <Text style={styles.startBtnText}>Start Ordering</Text>
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
      <View style={styles.rowLeft}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowPrice}>${item.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.rowRight}>
        <TouchableOpacity style={styles.qtyBtn} onPress={onDecrement}>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.qty}</Text>
        <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={onIncrement}>
          <Text style={styles.qtyBtnPlusText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeIcon}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CartScreen() {
  const { items, addItem, removeItem, updateQty, clearCart, totalPrice } =
    useCartStore();

  if (items.length === 0) return <EmptyCart />;

  function handlePlaceOrder() {
    Alert.alert("Confirm Order", "Ready to place your order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Place Order",
        onPress: () => {
          clearCart();
          Alert.alert(
            "Order Placed! 🎉",
            "Your food will be ready in ~20 minutes. Thank you!"
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
            <Text style={styles.listHeaderText}>My Order</Text>
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
              <Text style={styles.footerMeta}>Items</Text>
              <Text style={styles.footerMeta}>{itemCount}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.footerRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                ${totalPrice().toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.placeOrderBtn}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.placeOrderText}>Place Order 🎉</Text>
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
  container: { flex: 1, backgroundColor: "#FAFAF8" },
  listContent: { paddingBottom: 32 },

  // empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF8",
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, color: "#6b7280", fontWeight: "600" },
  startBtn: {
    marginTop: 24,
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  startBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

  // list header
  listHeader: { padding: 16 },
  listHeaderText: { fontSize: 22, fontWeight: "bold", color: "#1a1a1a" },

  // item row
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  rowLeft: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  rowPrice: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, color: "#374151", fontWeight: "bold" },
  qtyBtnPlus: { backgroundColor: "#7C3AED" },
  qtyBtnPlusText: { fontSize: 18, color: "#ffffff", fontWeight: "bold" },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    width: 36,
    textAlign: "center",
  },
  removeBtn: { marginLeft: 10 },
  removeIcon: { fontSize: 18 },

  // footer
  footer: {
    margin: 12,
    marginTop: 4,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  footerMeta: { color: "#6b7280", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: "#7C3AED" },
  placeOrderBtn: {
    marginTop: 16,
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  placeOrderText: { color: "#ffffff", fontSize: 17, fontWeight: "bold" },
});
