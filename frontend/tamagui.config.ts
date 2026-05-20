import { config as defaultConfig } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

// Bistro palette layered onto Tamagui's v3 light theme
const bistroOverrides = {
  primary: "#7C3AED",       // brand purple
  primaryLight: "#A78BFA",
  primaryDark: "#6D28D9",
  primarySoft: "#EDE9FE",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFAF8",
  ink: "#0F0F12",
  inkSoft: "#3F3F46",
  inkMuted: "#6B7280",
  hairline: "#E5E7EB",
  accentAmber: "#FEF3C7",
  accentAmberInk: "#92400E",
  accentMint: "#DCFCE7",
  accentMintInk: "#166534",
  danger: "#EF4444",
};

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      ...bistroOverrides,
      background: bistroOverrides.surfaceAlt,
      color: bistroOverrides.ink,
    },
    light_bistro: {
      ...defaultConfig.themes.light,
      ...bistroOverrides,
      background: bistroOverrides.surfaceAlt,
      color: bistroOverrides.ink,
    },
  },
});

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
