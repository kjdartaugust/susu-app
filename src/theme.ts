// FRONTIER-inspired palette: dark, violet OKLCH-derived accent, soft glows.
export const colors = {
  bg: "#0B0910", // near-black with a violet tint
  bgElevated: "#100C18",
  card: "#15111F",
  cardAlt: "#1E1830",
  border: "#2A2340",
  hairline: "#231D34",
  text: "#F4EFFB",
  muted: "#9A8FB5",
  faint: "#6C6484",

  // Accent: violet ~ OKLCH hue 285
  primary: "#A98BFF", // for text/icons on dark
  primarySolid: "#7C5CFF", // button fill
  primaryDeep: "#5B37E0",
  primarySoft: "rgba(124,92,255,0.16)",
  onPrimary: "#0B0910",

  // Secondary accent (recipient / money-in): warm gold
  gold: "#F5C877",
  goldSoft: "rgba(245,200,119,0.15)",

  // Tertiary glow used in gradients
  cyan: "#5CE6D0",
  pink: "#FF7AC6",

  danger: "#FF7A8A",
  dangerSoft: "rgba(255,122,138,0.14)",
};

export const fonts = {
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  // 900Black's web font file fails to decode, so the heaviest display weight
  // reuses 700Bold — still a strong serif, never a broken face.
  displayBlack: "Fraunces_700Bold",
};

export const radius = { sm: 12, md: 18, lg: 26, xl: 32, pill: 999 };

export const spacing = (n: number) => n * 4;
