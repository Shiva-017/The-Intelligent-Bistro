import { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useChatStore, Message } from "../../store/chatStore";
import { useCartStore } from "../../store/cartStore";
import { API_URL } from "../../constants/api";

type ChatResponse = {
  action: "add" | "remove" | "update" | "clear" | "none";
  items: { itemId: string; name: string; qty: number }[];
  reply: string;
};

export default function OrderScreen() {
  const [input, setInput] = useState("");
  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const { items: cartItems, applyAIAction } = useCartStore();
  const listRef = useRef<FlatList>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    addMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .slice(-10)
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, cart: cartItems, history }),
      });

      const data: ChatResponse = await res.json();

      if (data.action !== "none") {
        applyAIAction({ action: data.action, items: data.items });
      }

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.reply,
        cartAction: data.action !== "none" ? { action: data.action, items: data.items } : undefined,
      });
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, couldn't connect to server.",
      });
    } finally {
      setLoading(false);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === "user";
    return (
      <View>
        <View style={isUser ? styles.userBubble : styles.assistantBubble}>
          <Text style={isUser ? styles.userText : styles.assistantText}>{item.text}</Text>
        </View>
        {!isUser && item.cartAction && (
          <View style={styles.cartPill}>
            <Text style={styles.cartPillText}>✓ Cart updated</Text>
          </View>
        )}
      </View>
    );
  }

  const displayData: Message[] = isLoading
    ? [{ id: "loading", role: "assistant", text: "●  ●  ●" }, ...messages].reverse()
    : [...messages].reverse();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        ref={listRef}
        data={displayData}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.bottomBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything about the menu..."
          placeholderTextColor="#9ca3af"
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF8" },
  listContent: { paddingVertical: 12 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#7C3AED",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginVertical: 4,
    maxWidth: "75%",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginVertical: 4,
    maxWidth: "75%",
  },
  userText: { color: "#fff", fontSize: 15 },
  assistantText: { color: "#1a1a1a", fontSize: 15 },
  cartPill: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: "flex-start",
    marginLeft: 12,
    marginBottom: 4,
  },
  cartPillText: { color: "#166534", fontSize: 12 },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#FAFAF8",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#1a1a1a",
  },
  sendBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
