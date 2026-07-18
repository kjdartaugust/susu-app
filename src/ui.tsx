import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, radius } from "./theme";
import { useStore } from "./store";

/** Serif display heading (Fraunces). */
export function Display({
  children,
  size = 28,
  weight = "bold",
  style,
}: {
  children: React.ReactNode;
  size?: number;
  weight?: "semi" | "bold" | "black";
  style?: TextStyle;
}) {
  const family =
    weight === "black"
      ? fonts.displayBlack
      : weight === "bold"
        ? fonts.displayBold
        : fonts.display;
  return (
    <Text
      style={[
        {
          fontFamily: family,
          fontSize: size,
          color: colors.text,
          letterSpacing: -0.5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
  glow,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
}) {
  return (
    <View style={[styles.card, glow && styles.cardGlow, style]}>{children}</View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  small,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger" | "gold";
  disabled?: boolean;
  small?: boolean;
}) {
  const pad = small
    ? { paddingVertical: 9, paddingHorizontal: 16 }
    : { paddingVertical: 14, paddingHorizontal: 22 };

  if (variant === "primary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.9 : 1 }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, pad]}
        >
          <Text style={[styles.btnText, { color: "#fff" }, small && { fontSize: 14 }]}>
            {title}
          </Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const bg =
    variant === "gold"
      ? colors.gold
      : variant === "danger"
        ? colors.dangerSoft
        : "transparent";
  const fg =
    variant === "gold"
      ? "#241A05"
      : variant === "danger"
        ? colors.danger
        : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pad,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "ghost" && { borderWidth: 1, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.btnText, { color: fg }, small && { fontSize: 14 }]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & TextInputProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.faint}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Progress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={[colors.primary, colors.pink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${pct * 100}%` }]}
      />
    </View>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = ([...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 80) + 250; // violet–pink range
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `hsl(${hue} 45% 26%)`,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: `hsl(${hue} 50% 40%)`,
      }}
    >
      <Text
        style={{
          color: `hsl(${hue} 80% 82%)`,
          fontWeight: "700",
          fontSize: size * 0.36,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

export function Badge({
  text,
  tone = "muted",
}: {
  text: string;
  tone?: "green" | "gold" | "muted" | "danger";
}) {
  const map = {
    green: [colors.primarySoft, colors.primary],
    gold: [colors.goldSoft, colors.gold],
    danger: [colors.dangerSoft, colors.danger],
    muted: [colors.cardAlt, colors.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: "700" }}>{text}</Text>
    </View>
  );
}

/** Compact GH₵ / $ switch bound to the store. */
export function CurrencyToggle() {
  const { data, setDisplayCurrency } = useStore();
  return (
    <View style={styles.toggle}>
      {(["GHS", "USD"] as const).map((c) => {
        const active = data.displayCurrency === c;
        return (
          <Pressable
            key={c}
            onPress={() => setDisplayCurrency(c)}
            style={[styles.toggleItem, active && styles.toggleItemActive]}
          >
            <Text
              style={{
                color: active ? "#fff" : colors.muted,
                fontWeight: "800",
                fontSize: 13,
              }}
            >
              {c === "GHS" ? "GH₵" : "$"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Loader() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.bg,
      }}
    >
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardGlow: {
    shadowColor: colors.primarySolid,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  btn: {
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontWeight: "800", fontSize: 15, letterSpacing: 0.2 },
  fieldLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardAlt,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 4 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  section: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.cardAlt,
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    minWidth: 40,
    alignItems: "center",
  },
  toggleItemActive: { backgroundColor: colors.primarySolid },
});
