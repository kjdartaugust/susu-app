import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Avatar, Badge, Button, Card, Display } from "../ui";
import {
  FREQ_LABEL,
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
  const { data, togglePaid, deleteCircle } = useStore();
  const circle = data.circles.find((c) => c.id === circleId);
  const fmt = (n: number) => formatMoney(n, data.displayCurrency, data.usdRate);
  const liveIdx = circle ? currentCycleIndex(circle) : 0;
  const [viewIdx, setViewIdx] = useState(liveIdx);

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

  function confirmDelete() {
    Alert.alert("Delete circle?", `“${circle!.name}” will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteCircle(circle!.id);
          onBack();
        },
      },
    ]);
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
            text={isLive ? relativeDue(due) : viewIdx < liveIdx ? "Past" : "Upcoming"}
            tone={isLive ? "gold" : "muted"}
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
        return (
          <Pressable
            key={m.id}
            onPress={() => togglePaid(circle.id, viewIdx, m.id)}
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
                  {m.name === data.name ? "  (you)" : ""}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  Position {i + 1}
                  {isRecipient ? " · collects this round" : ""}
                </Text>
              </View>
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

      <View style={{ marginTop: 16 }}>
        <Button title="Delete circle" variant="danger" onPress={confirmDelete} />
      </View>
    </ScrollView>
  );
}
