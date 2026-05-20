import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useCartStore, CartItem } from "../../store/cartStore";

export default function CartScreen() {
  const { items, updateQty, removeItem, clearCart, totalPrice } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push("/(tabs)/order")}
        >
          <Text style={styles.startBtnText}>Start Ordering</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSub}>
            ${item.price.toFixed(2)} × {item.qty}
          </Text>
        </View>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQty(item.id, item.qty - 1)}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.qty}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, styles.qtyBtnPlus]}
            onPress={() => updateQty(item.id, item.qty + 1)}
          >
            <Text style={styles.qtyBtnPlusText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeItem(item.id)}
          >
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function handlePlaceOrder() {
    Alert.alert(
      "Order Placed! 🎉",
      "Your food will be ready in ~20 minutes.",
      [{ text: "OK", onPress: clearCart }]
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.subtotal}>
              Subtotal: ${totalPrice().toFixed(2)}
            </Text>
            <TouchableOpacity style={styles.orderBtn} onPress={handlePlaceOrder}>
              <Text style={styles.orderBtnText}>Place Order 🎉</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF8" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF8",
  },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 18, color: "#6b7280", marginTop: 16 },
  startBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  startBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  rowLeft: { flex: 1 },
  itemName: { fontWeight: "bold", fontSize: 15, color: "#1a1a1a" },
  itemSub: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, color: "#374151", lineHeight: 22 },
  qtyBtnPlus: { backgroundColor: "#7C3AED" },
  qtyBtnPlusText: { fontSize: 18, color: "#fff", lineHeight: 22 },
  qtyText: { fontSize: 16, fontWeight: "bold", width: 32, textAlign: "center" },
  removeBtn: { marginLeft: 12 },
  removeBtnText: { color: "#ef4444", fontSize: 18 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  subtotal: { fontSize: 17, fontWeight: "bold", marginBottom: 12, color: "#1a1a1a" },
  orderBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  orderBtnText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});
