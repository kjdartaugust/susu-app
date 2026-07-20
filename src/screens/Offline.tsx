import React, { useState } from "react";
import { Text, View } from "react-native";
import { colors } from "../theme";
import { Button, Display } from "../ui";

// Shown when we have a saved session but couldn't reach the server. The user
// is still signed in — this is a connection problem, and saying so (rather
// than dumping them back on a login form) is both truthful and less alarming.
export default function Offline({ onRetry }: { onRetry: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);

  async function retry() {
    setBusy(true);
    try {
      await onRetry();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.cardAlt,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Text style={{ fontSize: 26, color: colors.muted }}>⚡</Text>
      </View>

      <Display size={23} weight="bold" style={{ textAlign: "center" }}>
        Can&apos;t reach Susu
      </Display>
      <Text
        style={{
          color: colors.muted,
          textAlign: "center",
          lineHeight: 21,
          marginTop: 8,
          maxWidth: 300,
        }}
      >
        You&apos;re still signed in — we just couldn&apos;t load your circles.
        Check your connection and try again.
      </Text>

      <View style={{ marginTop: 24, alignSelf: "stretch", maxWidth: 320 }}>
        <Button title={busy ? "Trying…" : "Try again"} onPress={retry} disabled={busy} />
      </View>
    </View>
  );
}
