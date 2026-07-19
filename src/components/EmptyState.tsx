import React from "react";
import { Text, View } from "react-native";
import { colors } from "../theme";
import { Display } from "../ui";

// A first-run state should invite the next action, not just report absence.
// Centred glyph + one clear sentence + the action itself, instead of a grey
// box that says "nothing here".
export default function EmptyState({
  glyph,
  title,
  body,
  children,
}: {
  glyph: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 34, paddingHorizontal: 8 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.primarySoft,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Text style={{ fontSize: 27, color: colors.primary }}>{glyph}</Text>
      </View>

      <Display size={21} weight="bold" style={{ textAlign: "center" }}>
        {title}
      </Display>
      <Text
        style={{
          color: colors.muted,
          textAlign: "center",
          lineHeight: 21,
          marginTop: 8,
          maxWidth: 290,
        }}
      >
        {body}
      </Text>

      {children && <View style={{ marginTop: 22, alignSelf: "stretch", gap: 10 }}>{children}</View>}
    </View>
  );
}
