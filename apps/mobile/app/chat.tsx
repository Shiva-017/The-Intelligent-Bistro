import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useChatStore } from "../store/chat";
import { useCartStore } from "../store/cart";
import { sendMessage } from "../services/api";
import { ChatBubble } from "../components/ChatBubble";
import { fetchMenu } from "../services/api";
import { MenuItem } from "../../../packages/types/src";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const listRef = useRef<FlatList>(null);

  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const { items: cartItems, applyActions } = useCartStore();

  async function loadMenuIfNeeded() {
    if (menuItems.length === 0) {
      const res = await fetchMenu();
      setMenuItems(res.items);
      return res.items;
    }
    return menuItems;
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    addMessage({ role: "user", content: text });
    setLoading(true);

    try {
      const items = await loadMenuIfNeeded();
      const response = await sendMessage(text, cartItems);
      applyActions(response.actions, items);
      addMessage({ role: "assistant", content: response.reply });
    } catch {
      addMessage({
        role: "assistant",
        content: "Sorry, I couldn't process that. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={["top", "left", "right"]}>
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#242424]">
        <View>
          <Text className="text-[#f5f5f5] text-lg font-bold">AI Concierge</Text>
          <Text className="text-[#888888] text-xs">Tell me what you'd like to order</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-[#888888] text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      {messages.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">✦</Text>
          <Text className="text-[#f5f5f5] text-base font-semibold mb-2 text-center">
            What can I get for you?
          </Text>
          <Text className="text-[#888888] text-sm text-center leading-5">
            Try: "Add two spicy chicken sandwiches and a sparkling water" or "What do you recommend for starters?"
          </Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View className="px-5 pb-2 flex-row items-center gap-2">
          <ActivityIndicator color="#d4af37" size="small" />
          <Text className="text-[#888888] text-sm">Thinking…</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View className="flex-row items-end px-4 pb-4 pt-2 gap-3 border-t border-[#242424]">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="What would you like?"
            placeholderTextColor="#888888"
            multiline
            className="flex-1 bg-[#141414] border border-[#242424] rounded-2xl px-4 py-3 text-[#f5f5f5] text-sm max-h-28"
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
            className={`rounded-full w-11 h-11 items-center justify-center ${
              input.trim() && !isLoading ? "bg-[#d4af37]" : "bg-[#242424]"
            }`}
          >
            <Text className="text-lg">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
