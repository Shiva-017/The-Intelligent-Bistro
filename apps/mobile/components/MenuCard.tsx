import { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MenuItem } from "../../../packages/types/src";

interface Props {
  item: MenuItem;
  onAdd: (quantity: number) => void;
}

export function MenuCard({ item, onAdd }: Props) {
  const [adding, setAdding] = useState(false);

  function handleAdd() {
    setAdding(true);
    onAdd(1);
    setTimeout(() => setAdding(false), 600);
  }

  return (
    <View className="bg-[#141414] rounded-2xl mb-4 overflow-hidden border border-[#242424]">
      <Image
        source={{ uri: item.image }}
        className="w-full h-44"
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-1">
          <Text className="text-[#f5f5f5] text-base font-semibold flex-1 mr-2" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-[#d4af37] text-base font-bold">${item.price}</Text>
        </View>

        <Text className="text-[#888888] text-xs leading-4 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-1 flex-wrap flex-1 mr-3">
            {item.tags.slice(0, 2).map((tag) => (
              <View key={tag} className="bg-[#242424] rounded-full px-2 py-0.5">
                <Text className="text-[#888888] text-[10px] uppercase tracking-widest">{tag}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleAdd}
            className={`rounded-full px-5 py-2 ${adding ? "bg-[#b8962e]" : "bg-[#d4af37]"}`}
          >
            <Text className="text-[#0a0a0a] font-bold text-sm">
              {adding ? "Added ✓" : "+ Add"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
