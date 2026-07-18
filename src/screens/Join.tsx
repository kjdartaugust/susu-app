import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors } from "../theme";
import { Button, Card, Display, Field } from "../ui";
import { formatMoney } from "../logic";
import type { InvitePreview } from "../api";

// Join a circle from an invite code. The code can be prefilled (e.g. from a
// ?invite= link on web) or pasted in.
export default function Join({
  initialCode = "",
  onCancel,
  onJoined,
}: {
  initialCode?: string;
  onCancel: () => void;
  onJoined: () => void;
}) {
  const { previewInvite, acceptInvite, data } = useStore();
  const [code, setCode] = useState(initialCode);
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fmt = (n: number) => formatMoney(n, data.displayCurrency, data.usdRate);

  async function look(token: string) {
    const t = token.trim();
    if (!t) return;
    setBusy(true);
    setError(null);
    setPreview(null);
    try {
      setPreview(await previewInvite(t));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invite not found.");
    } finally {
      setBusy(false);
    }
  }

  // If we arrived with a code already (a shared link), look it up right away.
  useEffect(() => {
    if (initialCode) look(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function join() {
    setBusy(true);
    setError(null);
    try {
      await acceptInvite(code.trim());
      onJoined();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't join.");
      setBusy(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          marginTop: 4,
        }}
      >
        <Display size={26} weight="black">
          Join a circle
        </Display>
        <Pressable onPress={onCancel}>
          <Text style={{ color: colors.muted, fontSize: 16 }}>Cancel</Text>
        </Pressable>
      </View>

      <Card>
        <Field
          label="Invite code"
          placeholder="Paste the code you were sent"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
        />
        <Button
          title={busy && !preview ? "Checking…" : "Look up"}
          variant="ghost"
          onPress={() => look(code)}
          disabled={busy || !code.trim()}
        />
      </Card>

      {error && (
        <Text style={{ color: colors.danger, marginTop: 14, fontSize: 14 }}>
          {error}
        </Text>
      )}

      {preview && (
        <Card style={{ marginTop: 16 }}>
          {preview.claimed ? (
            <Text style={{ color: colors.muted }}>
              This invite has already been used.
            </Text>
          ) : (
            <>
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                You're joining
              </Text>
              <Display size={20} weight="semi" style={{ marginTop: 2 }}>
                {preview.circleName}
              </Display>
              <Text style={{ color: colors.muted, marginTop: 6 }}>
                as <Text style={{ color: colors.text, fontWeight: "700" }}>
                  {preview.memberName}
                </Text>{" "}
                · {fmt(preview.contribution)} per round
              </Text>
              <View style={{ marginTop: 16 }}>
                <Button
                  title={busy ? "Joining…" : "Join circle"}
                  onPress={join}
                  disabled={busy}
                />
              </View>
            </>
          )}
        </Card>
      )}
    </ScrollView>
  );
}
