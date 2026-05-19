import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </>
  );
}
