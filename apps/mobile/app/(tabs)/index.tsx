import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MenuItem } from "../../../../packages/types/src";
import { fetchMenu } from "../../services/api";
import { MenuCard } from "../../components/MenuCard";
import { useCartStore } from "../../store/cart";

const CATEGORIES = ["all", "starters", "mains", "sides", "drinks", "desserts"] as const;
type Category = (typeof CATEGORIES)[number];

export default function MenuScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const add = useCartStore((s) => s.add);

  useEffect(() => {
    fetchMenu()
      .then((res) => setItems(res.items))
      .catch(() => setError("Could not load the menu. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[#888888] text-xs tracking-[3px] uppercase">Welcome to</Text>
          <Text className="text-[#f5f5f5] text-3xl font-bold tracking-tight">
            The Intelligent{"\n"}Bistro
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/chat")}
          className="bg-[#d4af37] rounded-full px-4 py-2 flex-row items-center gap-2"
        >
          <Text className="text-[#0a0a0a] font-bold text-sm">✦ Ask AI</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4 mb-2"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full border ${
              activeCategory === cat
                ? "bg-[#d4af37] border-[#d4af37]"
                : "bg-transparent border-[#242424]"
            }`}
          >
            <Text
              className={`text-xs font-semibold uppercase tracking-widest ${
                activeCategory === cat ? "text-[#0a0a0a]" : "text-[#888888]"
              }`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#d4af37" size="large" />
        </View>
      )}

      {error && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[#888888] text-center text-base">{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuCard item={item} onAdd={(qty) => add(item, qty)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
