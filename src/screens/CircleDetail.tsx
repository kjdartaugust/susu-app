import React, { useState } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Avatar, Badge, Button, Card, Display } from "../ui";
import { confirm, notify } from "../dialog";
import CircleRing from "../components/CircleRing";
import {
  FREQ_LABEL,
  circleComplete,
  currentCycleIndex,
  formatMoney,
  membersPaidThisCycle,
  nextCycleDate,
  paidKey,
  potSize,
  recipientForCycle,
  relativeDue,
  totalCycles,
} from "../logic";

export default function CircleDetail({
  circleId,
  onBack,
}: {
  circleId: string;
  onBack: () => void;
}) {
  const { data, togglePaid, deleteCircle, createInvite } = useStore();
  const circle = data.circles.find((c) => c.id === circleId);
  const fmt = (n: number) => formatMoney(n, data.displayCurrency, data.usdRate);
  const liveIdx = circle ? currentCycleIndex(circle) : 0;
  const [viewIdx, setViewIdx] = useState(liveIdx);
  const [invite, setInvite] = useState<{ name: string; link: string } | null>(
    null
  );
  const [invitingId, setInvitingId] = useState<string | null>(null);

  if (!circle) {
    return (
      <View style={{ padding: 16 }}>
        <Button title="‹ Back" variant="ghost" onPress={onBack} />
      </View>
    );
  }

  const cycles = totalCycles(circle);
  const recipient = recipientForCycle(circle, viewIdx);
  const paidN = membersPaidThisCycle(circle, viewIdx);
  const due = nextCycleDate(circle, viewIdx);
  const isLive = viewIdx === liveIdx;
  const done = circleComplete(circle) && viewIdx === liveIdx;

  function confirmDelete() {
    confirm({
      title: "Delete circle?",
      message: `“${circle!.name}” will be removed.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteCircle(circle!.id);
          onBack();
        } catch (e) {
          notify(
            "Couldn't delete",
            e instanceof Error ? e.message : "Please try again."
          );
        }
      },
    });
  }

  async function inviteMember(m: { id: string; name: string }) {
    if (!circle) return;
    setInvitingId(m.id);
    try {
      const token = await createInvite(circle.id, m.id);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const link = origin ? `${origin}/?invite=${token}` : token;
      setInvite({ name: m.name, link });
      // Best-effort native share sheet; on web it may be unavailable, and the
      // inline panel below still shows the link to copy.
      try {
        await Share.share({
          message: `Join my susu circle "${circle.name}" on Susu — ${link}`,
        });
      } catch {
        /* ignore */
      }
    } catch (e) {
      notify(
        "Couldn't create invite",
        e instanceof Error ? e.message : "Please try again."
      );
    } finally {
      setInvitingId(null);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={onBack} style={{ marginBottom: 8, marginTop: 4 }}>
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}>
          ‹ Circles
        </Text>
      </Pressable>

      <Display size={30} weight="black">
        {circle.name}
      </Display>
      <Text style={{ color: colors.muted, marginTop: 4 }}>
        {fmt(circle.contribution)} · {FREQ_LABEL[circle.frequency]} · pot{" "}
        {fmt(potSize(circle))}
      </Text>

      {/* The same ring as the welcome screen, now showing this actual circle:
          who is in it and who collects the round being viewed. */}
      <View style={{ alignItems: "center", marginTop: 18 }}>
        <CircleRing
          size={224}
          members={circle.members.map((m) => m.name)}
          amount={fmt(potSize(circle))}
          step={recipient ? circle.members.findIndex((m) => m.id === recipient.id) : 0}
          showCaption={false}
        />
      </View>

      {/* Cycle selector */}
      <View style={{ marginTop: 20 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {Array.from({ length: cycles }).map((_, i) => {
            const active = i === viewIdx;
            const done = i < liveIdx;
            return (
              <Pressable
                key={i}
                onPress={() => setViewIdx(i)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: radius.pill,
                  backgroundColor: active ? colors.primary : colors.cardAlt,
                  borderWidth: i === liveIdx ? 1 : 0,
                  borderColor: colors.gold,
                }}
              >
                <Text
                  style={{
                    color: active ? "#08130B" : done ? colors.muted : colors.text,
                    fontWeight: "700",
                  }}
                >
                  Round {i + 1}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Round summary */}
      <Card style={{ marginTop: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 17 }}>
            Round {viewIdx + 1} of {cycles}
          </Text>
          <Badge
            text={
              done
                ? "Circle complete"
                : isLive
                  ? relativeDue(due)
                  : viewIdx < liveIdx
                    ? "Past"
                    : "Upcoming"
            }
            tone={done ? "green" : isLive ? "gold" : "muted"}
          />
        </View>
        {recipient && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 14,
              backgroundColor: colors.goldSoft,
              padding: 12,
              borderRadius: radius.sm,
            }}
          >
            <Avatar name={recipient.name} size={40} />
            <View>
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                Collects the pot
              </Text>
              <Text style={{ color: colors.gold, fontWeight: "800", fontSize: 17 }}>
                {recipient.name} · {fmt(potSize(circle))}
              </Text>
            </View>
          </View>
        )}
        <Text style={{ color: colors.muted, marginTop: 12 }}>
          {paidN}/{circle.members.length} members have paid this round
        </Text>
      </Card>

      {/* Members / payment toggles */}
      <Text
        style={{
          color: colors.muted,
          fontWeight: "700",
          textTransform: "uppercase",
          fontSize: 13,
          letterSpacing: 0.5,
          marginTop: 22,
          marginBottom: 8,
        }}
      >
        Tap to mark paid
      </Text>
      {circle.members.map((m, i) => {
        const paid = !!circle.paid[paidKey(viewIdx, m.id)];
        const isRecipient = recipient?.id === m.id;
        // Match on account id, not display name: member names are free text and
        // two people in a circle can easily share one.
        const isYou = !!data.userId && m.userId === data.userId;
        return (
          <Pressable
            key={m.id}
            onPress={() => {
              togglePaid(circle.id, viewIdx, m.id).catch((e) =>
                notify(
                  "Couldn't save",
                  e instanceof Error ? e.message : "Please try again."
                )
              );
            }}
          >
            <Card
              style={{
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
              }}
            >
              <Avatar name={m.name} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                  {m.name}
                  {isYou ? "  (you)" : ""}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  Position {i + 1}
                  {isRecipient ? " · collects this round" : ""}
                </Text>
              </View>
              {m.userId ? (
                <View style={{ marginRight: 6 }}>
                  <Badge text="Joined" tone="green" />
                </View>
              ) : (
                circle.owner &&
                !isYou && (
                  <View style={{ marginRight: 6 }}>
                    <Button
                      title={invitingId === m.id ? "…" : "Invite"}
                      variant="ghost"
                      small
                      onPress={() => inviteMember(m)}
                    />
                  </View>
                )
              )}
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: paid ? colors.primary : colors.border,
                  backgroundColor: paid ? colors.primary : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {paid && (
                  <Text style={{ color: "#08130B", fontWeight: "900" }}>✓</Text>
                )}
              </View>
            </Card>
          </Pressable>
        );
      })}

      {invite && (
        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
            Invite link for {invite.name}
          </Text>
          <Text
            selectable
            style={{ color: colors.primary, marginTop: 8, fontSize: 13 }}
          >
            {invite.link}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>
            Send this to {invite.name}. When they open it and sign in, they join
            this circle.
          </Text>
          <View style={{ marginTop: 12 }}>
            <Button
              title="Done"
              variant="ghost"
              small
              onPress={() => setInvite(null)}
            />
          </View>
        </Card>
      )}

      {circle.owner && (
        <View style={{ marginTop: 16 }}>
          <Button
            title="Delete circle"
            variant="danger"
            onPress={confirmDelete}
          />
        </View>
      )}
    </ScrollView>
  );
}
