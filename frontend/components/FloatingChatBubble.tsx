import { useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from "react-native";
import { useChatStore } from "../store/chatStore";
import ChatModal from "./ChatModal";

export default function FloatingChatBubble() {
  const [open, setOpen] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  // Detect current route — hide the bubble on Cart so it doesn't sit on top of Place Order
  const segments = useSegments();
  const onCart = segments[segments.length - 1] === "cart";

  // Soft continuous pulse ring to draw the eye
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const messageCount = useChatStore((s) => s.messages.length);
  const hasUnseenContent = !open && messageCount > 1;

  function handlePress() {
    Animated.sequence([
      Animated.timing(press, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(press, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    setOpen(true);
  }

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  // ChatModal still mounts so state stays warm; just hide the trigger on Cart
  if (onCart) return <ChatModal visible={open} onClose={() => setOpen(false)} />;

  return (
    <>
      <View style={styles.anchor} pointerEvents="box-none">
        {/* Pulse ring */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        <Animated.View style={{ transform: [{ scale: press }] }}>
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.9}
            style={styles.bubble}
            accessibilityLabel="Call your waiter"
          >
            <RNText style={styles.bubbleEmoji}>🧑‍🍳</RNText>
            {hasUnseenContent && <View style={styles.dot} />}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.labelPill}>
          <RNText style={styles.labelPillText}>Call your waiter</RNText>
        </View>
      </View>

      <ChatModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    right: 16,
    bottom: 100, // sits above the tab bar
    alignItems: "center",
    zIndex: 100,
  },
  bubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  bubbleEmoji: { fontSize: 28 },
  ring: {
    position: "absolute",
    top: 0,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7C3AED",
  },
  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FAFAF8",
  },
  labelPill: {
    marginTop: 8,
    backgroundColor: "#0F0F12",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  labelPillText: {
    fontFamily: "InterBold",
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
