import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../constants/api";
import { useCartStore } from "../store/cartStore";
import { MenuItem, useMenuStore } from "../store/menuStore";

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Starters", "Mains", "Sides", "Drinks", "Desserts"] as const;
type Category = (typeof CATEGORIES)[number];

const COLORS = {
  bg: "#FAFAF8",
  card: "#ffffff",
  purple: "#7C3AED",
  purpleLight: "#ede9fe",
  text: "#1a1a1a",
  muted: "#6b7280",
  border: "#e5e7eb",
  chip: "#f3f4f6",
  chipText: "#374151",
  amber: "#fef3c7",
  amberText: "#92400e",
  green: "#dcfce7",
  greenText: "#166534",
} as const;

// ─── AddButton ────────────────────────────────────────────────────────────────

function AddButton({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [confirmed, setConfirmed] = useState(false);

  function handlePress() {
    onPress();
    setConfirmed(true);

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
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
        <Text style={[styles.addBtnText, confirmed && styles.addBtnTextConfirmed]}>
          {confirmed ? "✓ Added" : "+ Add"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── MenuCard ─────────────────────────────────────────────────────────────────

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const isSpicy = item.spicy;
  const isPopular = item.popular;

  return (
    <View style={styles.card}>
      {/* badges row */}
      {(isSpicy || isPopular) && (
        <View style={styles.badgeRow}>
          {isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Popular</Text>
            </View>
          )}
          {isSpicy && <Text style={styles.spicyLabel}>🌶 Spicy</Text>}
        </View>
      )}

      {/* main row */}
      <View style={styles.cardBody}>
        <View style={styles.cardInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDesc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          <AddButton onPress={onAdd} />
        </View>
      </View>
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.catScroll}
      contentContainerStyle={styles.catContent}
    >
      {CATEGORIES.map((cat) => {
        const active = cat === selected;
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onSelect(cat)}
            style={[styles.catBtn, active && styles.catBtnActive]}
          >
            <Text style={[styles.catText, active && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── MenuScreen ───────────────────────────────────────────────────────────────

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
          setError("Failed to load menu. Is the API running?");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const filtered =
    category === "All"
      ? items
      : items.filter((i) => i.category.toLowerCase() === category.toLowerCase());

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
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
            <Text style={styles.emptyText}>No items in this category.</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg },
  errorEmoji: { fontSize: 36, marginBottom: 12 },
  errorText: { color: COLORS.muted, fontSize: 15, textAlign: "center", paddingHorizontal: 32 },

  // category bar
  catScroll: { maxHeight: 52, flexGrow: 0 },
  catContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.chip,
  },
  catBtnActive: { backgroundColor: COLORS.purple },
  catText: { fontSize: 14, fontWeight: "600", color: COLORS.chipText },
  catTextActive: { color: "#fff" },

  // list
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { color: COLORS.muted, fontSize: 15 },

  // card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  popularBadge: {
    backgroundColor: COLORS.amber,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  popularBadgeText: { color: COLORS.amberText, fontSize: 11, fontWeight: "700" },
  spicyLabel: { fontSize: 12, color: COLORS.amberText, fontWeight: "600" },
  cardBody: { flexDirection: "row", alignItems: "center" },
  cardInfo: { flex: 1, paddingRight: 12 },
  itemName: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  itemDesc: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  cardActions: { alignItems: "flex-end", gap: 8 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: COLORS.purple },

  // add button
  addBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 72,
    alignItems: "center",
  },
  addBtnConfirmed: { backgroundColor: COLORS.green },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  addBtnTextConfirmed: { color: COLORS.greenText },
});
