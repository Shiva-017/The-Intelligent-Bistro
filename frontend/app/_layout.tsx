import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../tamagui.config";

export default function RootLayout() {
  // Tamagui's v3 font config references 'Inter' / 'InterBold' face names.
  // Loading the Google Fonts under those exact names lets Tamagui's tokens render correctly.
  const [fontsLoaded] = useFonts({
    Inter: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    InterMedium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    InterSemiBold: require("@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"),
    InterBold: require("@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"),
    InterExtraBold: require("@expo-google-fonts/inter/800ExtraBold/Inter_800ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAF8" },
});
