import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Button, Card, Display, Field } from "../ui";
import CircleRing from "../components/CircleRing";
import { FREQ_LABEL, formatMoney } from "../logic";
import type { InvitePreview } from "../api";

// Join a circle from an invite code — for most people the very first screen of
// the app, arriving from a friend's link. So when we know what the invitation
// is, lead with it (the group, and the seat being offered) rather than with a
// form. The code box only appears when there's nothing to show yet.
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

  const open = preview && !preview.claimed;

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 120,
        width: "100%",
        maxWidth: 460,
        alignSelf: "center",
      }}
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
          {open ? "You're invited" : "Join a circle"}
        </Display>
        <Pressable onPress={onCancel} hitSlop={10}>
          <Text style={{ color: colors.muted, fontSize: 16 }}>Cancel</Text>
        </Pressable>
      </View>

      {open && preview ? (
        <>
          <Text style={{ color: colors.muted, lineHeight: 22, marginBottom: 4 }}>
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              {preview.organiser}
            </Text>{" "}
            invited you to join
          </Text>
          <Display size={28} weight="black">
            {preview.circleName}
          </Display>

          {/* Their circle, with the seat you'd be taking lit up. */}
          <View style={{ alignItems: "center", marginTop: 22, marginBottom: 6 }}>
            <CircleRing
              size={216}
              members={preview.members}
              amount={fmt(preview.contribution * preview.members.length)}
              step={preview.position}
              showCaption={false}
            />
          </View>

          <Card style={{ marginTop: 16 }}>
            <Row label="Your seat" value={`${preview.memberName} · position ${preview.position + 1}`} />
            <Row label="You put in" value={`${fmt(preview.contribution)} ${FREQ_LABEL[preview.frequency].toLowerCase()}`} />
            <Row
              label="You collect"
              value={`${fmt(preview.contribution * preview.members.length)} on your turn`}
              last
            />
          </Card>

          {error && (
            <Text style={{ color: colors.danger, marginTop: 14, fontSize: 14 }}>
              {error}
            </Text>
          )}

          <View style={{ marginTop: 18 }}>
            <Button
              title={busy ? "Joining…" : "Join circle"}
              onPress={join}
              disabled={busy}
            />
          </View>
          <Text
            style={{
              color: colors.faint,
              fontSize: 12,
              textAlign: "center",
              marginTop: 12,
              lineHeight: 18,
            }}
          >
            Susu only keeps track of the circle. It doesn&apos;t move any money.
          </Text>
        </>
      ) : (
        <>
          <Card>
            <Field
              label="Invite code"
              placeholder="Paste the code you were sent"
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
            />
            <Button
              title={busy ? "Checking…" : "Look up"}
              variant="ghost"
              onPress={() => look(code)}
              disabled={busy || !code.trim()}
            />
          </Card>

          {preview?.claimed && (
            <Card style={{ marginTop: 16, borderColor: colors.dangerSoft }}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                This invite has already been used
              </Text>
              <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>
                Someone has already taken that seat. Ask{" "}
                {preview.organiser} for a new link.
              </Text>
            </Card>
          )}

          {error && (
            <Text style={{ color: colors.danger, marginTop: 14, fontSize: 14 }}>
              {error}
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.hairline,
        gap: 12,
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 14 }}>{label}</Text>
      <Text
        style={{
          color: colors.text,
          fontWeight: "700",
          fontSize: 14,
          textAlign: "right",
          flexShrink: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
