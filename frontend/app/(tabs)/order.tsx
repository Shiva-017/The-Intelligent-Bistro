import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCartStore } from "../../store/cartStore";
import { useChatStore, Message } from "../../store/chatStore";
import { API_URL } from "../../constants/api";

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((n) => (n === 3 ? 1 : n + 1));
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.assistantWrapper}>
      <View style={[styles.bubble, styles.assistantBubble]}>
        <View style={styles.dotsRow}>
          {[1, 2, 3].map((d) => (
            <Text
              key={d}
              style={[styles.dot, { opacity: d <= dotCount ? 1 : 0.25 }]}
            >
              ●
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const showCartPill =
    !isUser &&
    message.cartAction != null &&
    message.cartAction.action !== "none";

  if (isUser) {
    return (
      <View style={styles.userWrapper}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantWrapper}>
      <View style={[styles.bubble, styles.assistantBubble]}>
        <Text style={styles.assistantText}>{message.text}</Text>
      </View>
      {showCartPill && (
        <View style={styles.cartPillRow}>
          <View style={styles.cartPill}>
            <Text style={styles.cartPillText}>✓ Cart updated</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrderScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState("");

  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const { items: cartItems, applyAIAction } = useCartStore();

  async function handleSend() {
    const text = inputText.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
    };
    addMessage(userMessage);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(API_URL + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          cart: cartItems,
          history: messages.slice(-10),
        }),
      });
      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.reply ?? "I didn't understand that.",
        cartAction:
          data.action !== "none"
            ? { action: data.action, items: data.items ?? [] }
            : undefined,
      };
      addMessage(assistantMessage);

      if (data.action && data.action !== "none") {
        applyAIAction({ action: data.action, items: data.items ?? [] });
      }
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I couldn't reach the server. Make sure the backend is running.",
      });
    } finally {
      setLoading(false);
    }
  }

  const canSend = inputText.trim().length > 0 && !isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message your bistro assistant..."
          placeholderTextColor="#9ca3af"
          returnKeyType="send"
          onSubmitEditing={handleSend}
          multiline={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Text style={[styles.sendIcon, canSend && styles.sendIconActive]}>
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF8" },
  listContent: { paddingVertical: 12, paddingBottom: 8 },

  // wrappers
  userWrapper: {
    alignItems: "flex-end",
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  assistantWrapper: {
    alignItems: "flex-start",
    marginVertical: 4,
    paddingHorizontal: 12,
  },

  // bubbles
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "78%",
  },
  userBubble: {
    backgroundColor: "#7C3AED",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderBottomLeftRadius: 4,
  },
  userText: { color: "#ffffff", fontSize: 15, lineHeight: 22 },
  assistantText: { color: "#1a1a1a", fontSize: 15, lineHeight: 22 },

  // typing dots
  dotsRow: { flexDirection: "row", alignItems: "center", paddingVertical: 2 },
  dot: { fontSize: 18, color: "#9ca3af", marginHorizontal: 2 },

  // cart pill
  cartPillRow: { marginTop: 6, marginLeft: 4 },
  cartPill: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  cartPillText: { color: "#166534", fontSize: 12, fontWeight: "600" },

  // input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: "#ffffff",
    marginRight: 8,
    color: "#1a1a1a",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: { backgroundColor: "#7C3AED" },
  sendIcon: { fontSize: 20, color: "#9ca3af" },
  sendIconActive: { color: "#ffffff" },
});
