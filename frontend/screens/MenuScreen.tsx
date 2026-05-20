import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import { XStack, YStack } from "tamagui";
import { API_URL } from "../constants/api";
import { useCartStore } from "../store/cartStore";
import { MenuItem, useMenuStore } from "../store/menuStore";

const CATEGORIES = ["All", "Starters", "Mains", "Sides", "Drinks", "Desserts"] as const;
type Category = (typeof CATEGORIES)[number];

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
  amber: "#FEF3C7",
  amberInk: "#92400E",
  rose: "#FEE2E2",
  roseInk: "#B91C1C",
  mint: "#DCFCE7",
  mintInk: "#166534",
} as const;

// ─── AddButton ────────────────────────────────────────────────────────────────

function AddButton({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [confirmed, setConfirmed] = useState(false);

  function handlePress() {
    onPress();
    setConfirmed(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.86, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setConfirmed(false), 1200);
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.addBtn, confirmed && styles.addBtnConfirmed]}
        activeOpacity={0.85}
      >
        <RNText
          style={[
            styles.addBtnText,
            confirmed && { color: C.mintInk },
          ]}
        >
          {confirmed ? "✓ Added" : "+ Add"}
        </RNText>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const isSpicy = item.spicy;
  const isPopular = item.popular;
  const hasBadges = isSpicy || isPopular;

  return (
    <View style={styles.card}>
      {hasBadges && (
        <View style={styles.badgeRow}>
          {isPopular && (
            <View style={styles.popularBadge}>
              <RNText style={styles.popularBadgeText}>⭐ POPULAR</RNText>
            </View>
          )}
          {isSpicy && (
            <View style={styles.spicyBadge}>
              <RNText style={styles.spicyBadgeText}>🌶 SPICY</RNText>
            </View>
          )}
        </View>
      )}

      <XStack alignItems="center">
        <YStack flex={1} paddingRight={12}>
          <RNText style={styles.itemName}>{item.name}</RNText>
          <RNText style={styles.itemDesc} numberOfLines={2}>
            {item.description}
          </RNText>
        </YStack>

        <YStack alignItems="flex-end" gap={8}>
          <RNText style={styles.itemPrice}>${item.price.toFixed(2)}</RNText>
          <AddButton onPress={onAdd} />
        </YStack>
      </XStack>
    </View>
  );
}

// ─── CategoryBar ──────────────────────────────────────────────────────────────

function CategoryBar({
  selected,
  onSelect,
}: {
  selected: Category;
  onSelect: (c: Category) => void;
}) {
  return (
    <View style={styles.catBarOuter}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((cat) => {
          const active = cat === selected;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelect(cat)}
              style={[styles.catBtn, active && styles.catBtnActive]}
              activeOpacity={0.8}
            >
              <RNText style={[styles.catText, active && styles.catTextActive]}>
                {cat}
              </RNText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MenuScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("All");

  const { items, setItems } = useMenuStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/menu`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: MenuItem[]) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Menu fetch failed:", err.message);
          setError("Our kitchen seems quiet — please check the connection.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    category === "All"
      ? items
      : items.filter((i) => i.category.toLowerCase() === category.toLowerCase());

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <RNText style={styles.loadingText}>Setting your table…</RNText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <RNText style={styles.errorEmoji}>⚠️</RNText>
        <RNText style={styles.errorText}>{error}</RNText>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <RNText style={styles.heroTitle}>Tonight's Menu</RNText>
        <RNText style={styles.heroSubtitle}>
          Fresh from the kitchen — what can I bring you?
        </RNText>
      </View>

      <CategoryBar selected={category} onSelect={setCategory} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuCard
            item={item}
            onAdd={() =>
              addItem({ id: item.id, name: item.name, price: item.price, qty: 1 })
            }
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <RNText style={styles.emptyText}>Nothing here yet — try another section.</RNText>
          </View>
        }
      />
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.surfaceAlt },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceAlt },
  loadingText: {
    fontFamily: "Inter",
    color: C.inkMuted,
    fontSize: 14,
    marginTop: 14,
    fontStyle: "italic",
  },
  errorEmoji: { fontSize: 42, marginBottom: 12 },
  errorText: {
    fontFamily: "Inter",
    fontSize: 15,
    color: C.inkMuted,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // hero header
  hero: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  heroTitle: {
    fontFamily: "InterExtraBold",
    fontSize: 26,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: "Inter",
    fontSize: 13.5,
    color: C.inkMuted,
    marginTop: 4,
    fontStyle: "italic",
  },

  // category bar — explicit height so shadows don't clip
  catBarOuter: {
    height: 64,
    paddingTop: 6,
    paddingBottom: 10,
  },
  catContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  catBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  catBtnActive: {
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  catText: {
    fontFamily: "InterSemiBold",
    fontSize: 13.5,
    fontWeight: "700",
    color: C.inkSoft,
  },
  catTextActive: { color: "#FFFFFF" },

  // list
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 140 },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { fontFamily: "Inter", color: C.inkMuted, fontSize: 15 },

  // card
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.hairline,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  popularBadge: {
    backgroundColor: C.amber,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularBadgeText: {
    fontFamily: "InterExtraBold",
    color: C.amberInk,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  spicyBadge: {
    backgroundColor: C.rose,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  spicyBadgeText: {
    fontFamily: "InterExtraBold",
    color: C.roseInk,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  itemName: {
    fontFamily: "InterBold",
    fontSize: 16.5,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 4,
  },
  itemDesc: {
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 19,
    color: C.inkMuted,
  },
  itemPrice: {
    fontFamily: "InterBold",
    fontSize: 17,
    fontWeight: "800",
    color: C.primary,
  },

  // add button
  addBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 78,
    alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnConfirmed: {
    backgroundColor: C.mint,
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
  },
  addBtnText: {
    fontFamily: "InterExtraBold",
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
