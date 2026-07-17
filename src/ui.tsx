import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius } from "./theme";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
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
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "gold"
        ? colors.gold
        : variant === "danger"
          ? "rgba(248,113,113,0.15)"
          : "transparent";
  const fg =
    variant === "primary" || variant === "gold"
      ? "#08130B"
      : variant === "danger"
        ? colors.danger
        : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        small && { paddingVertical: 8, paddingHorizontal: 14 },
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "ghost" && {
          borderWidth: 1,
          borderColor: colors.border,
        },
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
        placeholderTextColor={colors.muted}
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
      <View
        style={[
          styles.fill,
          { width: `${pct * 100}%`, backgroundColor: colors.primary },
        ]}
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
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `hsl(${hue} 45% 30%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: `hsl(${hue} 70% 78%)`,
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
    danger: ["rgba(248,113,113,0.15)", colors.danger],
    muted: [colors.cardAlt, colors.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: "700" }}>{text}</Text>
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
  btn: {
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontWeight: "800", fontSize: 15 },
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
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
});
