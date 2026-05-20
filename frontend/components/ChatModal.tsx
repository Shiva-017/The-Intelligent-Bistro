import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { XStack, YStack } from "tamagui";
import { API_URL } from "../constants/api";
import { useCartStore } from "../store/cartStore";
import { Message, useChatStore } from "../store/chatStore";

// Color literals — Tamagui's layout primitives don't require theme tokens for color resolution
const C = {
  ink: "#0F0F12",
  inkSoft: "#3F3F46",
  inkMuted: "#6B7280",
  primary: "#7C3AED",
  primarySoft: "#EDE9FE",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFAF8",
  hairline: "#E5E7EB",
  mint: "#DCFCE7",
  mintInk: "#166534",
  online: "#10B981",
} as const;

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((n) => (n === 3 ? 1 : n + 1));
    }, 380);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.assistantWrap}>
      <View style={[styles.bubble, styles.assistantBubble]}>
        <View style={styles.dotsRow}>
          {[1, 2, 3].map((d) => (
            <RNText
              key={d}
              style={[
                styles.dot,
                { opacity: d <= dotCount ? 1 : 0.25 },
              ]}
            >
              ●
            </RNText>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Bubble ───────────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const showCartPill =
    !isUser && message.cartAction != null && message.cartAction.action !== "none";

  if (isUser) {
    return (
      <View style={styles.userWrap}>
        <View style={[styles.bubble, styles.userBubble]}>
          <RNText style={styles.userText}>{message.text}</RNText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantWrap}>
      <View style={[styles.bubble, styles.assistantBubble]}>
        <RNText style={styles.assistantText}>{message.text}</RNText>
      </View>
      {showCartPill && (
        <View style={styles.cartPillRow}>
          <View style={styles.cartPill}>
            <RNText style={styles.cartPillText}>✓ Added to your tab</RNText>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChatModal({ visible, onClose }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState("");
  const [kbHeight, setKbHeight] = useState(0);

  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const { items: cartItems, applyAIAction } = useCartStore();

  // Manual keyboard tracking — more reliable than KeyboardAvoidingView inside a pageSheet Modal,
  // which is a known RN issue (the modal's own scroll-to-dismiss gesture interferes with KAV's frame).
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKbHeight(e.endCoordinates.height);
      // Re-anchor to the latest message once the keyboard is up
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKbHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        text: data.reply ?? "Pardon — I didn't catch that. Could you say it again?",
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
        text: "I can't reach the kitchen right now — make sure the backend is running and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const canSend = inputText.trim().length > 0 && !isLoading;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <YStack flex={1} backgroundColor={C.surfaceAlt}>
        {/* ── Header ── */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={20}
          paddingTop={18}
          paddingBottom={14}
          backgroundColor={C.surface}
          borderBottomWidth={1}
          borderBottomColor={C.hairline}
        >
          <XStack alignItems="center" gap={12}>
            <View style={styles.waiterAvatar}>
              <RNText style={styles.waiterAvatarEmoji}>🧑‍🍳</RNText>
            </View>
            <YStack>
              <RNText style={styles.headerTitle}>Claude, your waiter</RNText>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <RNText style={styles.statusText}>
                  At your service · happy to help
                </RNText>
              </View>
            </YStack>
          </XStack>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
            <RNText style={styles.closeIcon}>✕</RNText>
          </TouchableOpacity>
        </XStack>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
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

        {/* ── Input bar — manually lifted by keyboard height ── */}
        <View
          style={[
            styles.inputBar,
            {
              // When the keyboard is up: push the bar up by exactly the keyboard height
              // (and drop the home-indicator safe-area padding since the keyboard covers it).
              paddingBottom:
                kbHeight > 0 ? 10 : Platform.OS === "ios" ? 26 : 12,
              marginBottom: kbHeight,
            },
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="What would you like to order?"
            placeholderTextColor={C.inkMuted}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, canSend && styles.sendBtnActive]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            <RNText
              style={[
                styles.sendIcon,
                { color: canSend ? "#fff" : C.inkMuted },
              ]}
            >
              ↑
            </RNText>
          </TouchableOpacity>
        </View>
      </YStack>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  listContent: { paddingVertical: 16, paddingBottom: 16 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },

  // header
  waiterAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  waiterAvatarEmoji: { fontSize: 22 },
  headerTitle: {
    fontFamily: "InterBold",
    fontWeight: "800",
    fontSize: 17,
    color: C.ink,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.online },
  statusText: {
    fontFamily: "Inter",
    fontSize: 12,
    color: C.inkMuted,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontFamily: "InterBold",
    fontSize: 16,
    color: C.inkSoft,
    fontWeight: "700",
  },

  // bubble wrappers
  userWrap: { alignItems: "flex-end", marginVertical: 4, paddingHorizontal: 14 },
  assistantWrap: { alignItems: "flex-start", marginVertical: 4, paddingHorizontal: 14 },

  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    maxWidth: "82%",
  },
  userBubble: {
    backgroundColor: C.primary,
    borderBottomRightRadius: 6,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  assistantBubble: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.hairline,
    borderBottomLeftRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userText: {
    fontFamily: "Inter",
    fontSize: 15,
    lineHeight: 22,
    color: "#FFFFFF",
  },
  assistantText: {
    fontFamily: "Inter",
    fontSize: 15,
    lineHeight: 22,
    color: C.ink,
  },

  // typing dots
  dotsRow: { flexDirection: "row", alignItems: "center", paddingVertical: 2 },
  dot: { fontSize: 18, color: C.inkMuted, marginHorizontal: 2 },

  // cart pill
  cartPillRow: { marginTop: 6, marginLeft: 4 },
  cartPill: {
    backgroundColor: C.mint,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  cartPillText: {
    fontFamily: "InterSemiBold",
    color: C.mintInk,
    fontSize: 12,
    fontWeight: "600",
  },

  // input
  textInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: 23,
    paddingHorizontal: 18,
    fontSize: 15,
    backgroundColor: C.surfaceAlt,
    color: C.ink,
    fontFamily: "Inter",
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendIcon: { fontFamily: "InterBold", fontSize: 22, fontWeight: "800" },
});
