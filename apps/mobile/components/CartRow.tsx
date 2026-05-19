import { View, Text, TouchableOpacity } from "react-native";
import { CartItem } from "../../../packages/types/src";

interface Props {
  item: CartItem;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CartRow({ item, onRemove, onIncrement, onDecrement }: Props) {
  return (
    <View className="flex-row items-center px-5 py-4 border-b border-[#141414]">
      <View className="flex-1 mr-4">
        <Text className="text-[#f5f5f5] text-sm font-semibold mb-0.5">{item.name}</Text>
        {item.notes && (
          <Text className="text-[#888888] text-xs">{item.notes}</Text>
        )}
        <Text className="text-[#d4af37] text-sm font-bold mt-1">
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={item.quantity === 1 ? onRemove : onDecrement}
          className="w-8 h-8 rounded-full bg-[#242424] items-center justify-center"
        >
          <Text className="text-[#f5f5f5] text-lg leading-none">
            {item.quantity === 1 ? "×" : "−"}
          </Text>
        </TouchableOpacity>

        <Text className="text-[#f5f5f5] text-sm font-bold w-5 text-center">
          {item.quantity}
        </Text>

        <TouchableOpacity
          onPress={onIncrement}
          className="w-8 h-8 rounded-full bg-[#d4af37] items-center justify-center"
        >
          <Text className="text-[#0a0a0a] text-lg leading-none">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
