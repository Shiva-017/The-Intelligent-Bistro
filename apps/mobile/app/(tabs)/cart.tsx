import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCartStore } from "../../store/cart";
import { CartRow } from "../../components/CartRow";

export default function CartScreen() {
  const { items, remove, updateQuantity, clear, total, itemCount } = useCartStore();

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a] items-center justify-center px-8">
        <Text className="text-5xl mb-4">🍽</Text>
        <Text className="text-[#f5f5f5] text-xl font-semibold mb-2">Your cart is empty</Text>
        <Text className="text-[#888888] text-sm text-center mb-8">
          Browse the menu or ask the AI to add something for you.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/chat")}
          className="bg-[#d4af37] rounded-full px-6 py-3"
        >
          <Text className="text-[#0a0a0a] font-bold">✦ Ask the AI</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  function confirmClear() {
    Alert.alert("Clear cart?", "This will remove all items.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clear },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-[#242424]">
        <Text className="text-[#f5f5f5] text-2xl font-bold">Your Order</Text>
        <TouchableOpacity onPress={confirmClear}>
          <Text className="text-[#888888] text-sm">Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.menuItemId}
        renderItem={({ item }) => (
          <CartRow
            item={item}
            onRemove={() => remove(item.menuItemId)}
            onIncrement={() => updateQuantity(item.menuItemId, item.quantity + 1)}
            onDecrement={() => updateQuantity(item.menuItemId, item.quantity - 1)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 160 }}
      />

      <View className="absolute bottom-0 left-0 right-0 bg-[#141414] border-t border-[#242424] px-5 pb-8 pt-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-[#888888] text-sm">{itemCount()} item{itemCount() !== 1 ? "s" : ""}</Text>
          <Text className="text-[#888888] text-sm">Subtotal</Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-[#f5f5f5] text-2xl font-bold">Total</Text>
          <Text className="text-[#d4af37] text-2xl font-bold">${total().toFixed(2)}</Text>
        </View>
        <TouchableOpacity className="bg-[#d4af37] rounded-2xl py-4 items-center">
          <Text className="text-[#0a0a0a] font-bold text-base tracking-wide">Place Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
