import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors } from "../theme";
import { Avatar, Badge, Card, Progress, SectionTitle } from "../ui";
import {
  currentCycleIndex,
  formatMoney,
  goalSaved,
  membersPaidThisCycle,
  nextCycleDate,
  potSize,
  recipientForCycle,
  relativeDue,
} from "../logic";

export default function Home({
  onOpenCircle,
  onGoTab,
}: {
  onOpenCircle: (id: string) => void;
  onGoTab: (t: string) => void;
}) {
  const { data } = useStore();
  const cur = data.currency;

  const totalInSusu = data.circles.reduce((sum, c) => {
    const idx = currentCycleIndex(c);
    // amount the user has put in across all elapsed cycles
    let paidCount = 0;
    const me = c.members.find((m) => m.name === data.name) ?? c.members[0];
    for (let i = 0; i <= idx; i++) {
      if (me && c.paid[`${i}:${me.id}`]) paidCount++;
    }
    return sum + paidCount * c.contribution;
  }, 0);

  const totalSaved = data.goals.reduce((s, g) => s + goalSaved(g), 0);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: colors.muted, fontSize: 15, marginTop: 8 }}>
        Akwaaba,
      </Text>
      <Text
        style={{
          color: colors.text,
          fontSize: 30,
          fontWeight: "800",
          marginBottom: 16,
        }}
      >
        {data.name} 👋
      </Text>

      {/* Balance summary */}
      <Card style={{ backgroundColor: colors.primary, borderColor: colors.primary }}>
        <Text style={{ color: "#08130B", opacity: 0.7, fontWeight: "700" }}>
          Total saved everywhere
        </Text>
        <Text
          style={{ color: "#08130B", fontSize: 34, fontWeight: "900", marginTop: 4 }}
        >
          {formatMoney(totalInSusu + totalSaved, cur)}
        </Text>
        <View style={{ flexDirection: "row", gap: 20, marginTop: 12 }}>
          <View>
            <Text style={{ color: "#08130B", opacity: 0.7, fontSize: 13 }}>
              In susu
            </Text>
            <Text style={{ color: "#08130B", fontWeight: "800", fontSize: 17 }}>
              {formatMoney(totalInSusu, cur)}
            </Text>
          </View>
          <View>
            <Text style={{ color: "#08130B", opacity: 0.7, fontSize: 13 }}>
              In goals
            </Text>
            <Text style={{ color: "#08130B", fontWeight: "800", fontSize: 17 }}>
              {formatMoney(totalSaved, cur)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Susu circles */}
      <View style={{ marginTop: 24 }}>
        <SectionTitle>Your Susu Circles</SectionTitle>
        {data.circles.length === 0 && (
          <Pressable onPress={() => onGoTab("circles")}>
            <Card>
              <Text style={{ color: colors.muted }}>
                No circles yet. Tap “Circles” to start one.
              </Text>
            </Card>
          </Pressable>
        )}
        {data.circles.map((c) => {
          const idx = currentCycleIndex(c);
          const recipient = recipientForCycle(c, idx);
          const paidN = membersPaidThisCycle(c, idx);
          const due = nextCycleDate(c, idx);
          const complete = paidN === c.members.length;
          return (
            <Pressable key={c.id} onPress={() => onOpenCircle(c.id)}>
              <Card style={{ marginBottom: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}
                  >
                    {c.name}
                  </Text>
                  <Badge
                    text={complete ? "Cycle done" : relativeDue(due)}
                    tone={complete ? "green" : "gold"}
                  />
                </View>
                <Text style={{ color: colors.muted, marginTop: 4 }}>
                  Pot {formatMoney(potSize(c), cur)} · {c.members.length} members
                </Text>
                <View style={{ marginTop: 12 }}>
                  <Progress value={paidN / c.members.length} />
                  <Text style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>
                    {paidN}/{c.members.length} paid this round
                  </Text>
                </View>
                {recipient && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <Avatar name={recipient.name} size={28} />
                    <Text style={{ color: colors.text }}>
                      <Text style={{ color: colors.gold, fontWeight: "700" }}>
                        {recipient.name}
                      </Text>{" "}
                      collects this round
                    </Text>
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* Goals preview */}
      <View style={{ marginTop: 12 }}>
        <SectionTitle>Savings Goals</SectionTitle>
        {data.goals.length === 0 && (
          <Pressable onPress={() => onGoTab("goals")}>
            <Card>
              <Text style={{ color: colors.muted }}>
                No goals yet. Tap “Goals” to add one.
              </Text>
            </Card>
          </Pressable>
        )}
        {data.goals.map((g) => {
          const saved = goalSaved(g);
          return (
            <Pressable key={g.id} onPress={() => onGoTab("goals")}>
              <Card style={{ marginBottom: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                    {g.name}
                  </Text>
                  <Text style={{ color: colors.muted }}>
                    {formatMoney(saved, cur)} / {formatMoney(g.target, cur)}
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Progress value={saved / g.target} />
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
