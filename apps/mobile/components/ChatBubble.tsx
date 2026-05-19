import { View, Text } from "react-native";
import { ChatMessage } from "../../../packages/types/src";

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <View className={`flex-row ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-[#d4af37] items-center justify-center mr-2 mt-1 shrink-0">
          <Text className="text-[#0a0a0a] text-xs font-bold">✦</Text>
        </View>
      )}
      <View
        className={`max-w-[78%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[#d4af37] rounded-tr-sm"
            : "bg-[#141414] border border-[#242424] rounded-tl-sm"
        }`}
      >
        <Text
          className={`text-sm leading-5 ${isUser ? "text-[#0a0a0a] font-medium" : "text-[#f5f5f5]"}`}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}
