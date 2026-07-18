import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import {
  Avatar,
  Badge,
  Card,
  CurrencyToggle,
  Display,
  Progress,
  SectionTitle,
} from "../ui";
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
  const fmt = (n: number) => formatMoney(n, data.displayCurrency, data.usdRate);

  const totalInSusu = data.circles.reduce((sum, c) => {
    const idx = currentCycleIndex(c);
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 6,
          marginBottom: 4,
        }}
      >
        <Text style={{ color: colors.muted, fontSize: 15 }}>Akwaaba,</Text>
        <CurrencyToggle />
      </View>
      <Display size={34} weight="black" style={{ marginBottom: 18 }}>
        {data.name} 👋
      </Display>

      {/* Balance hero */}
      <View style={{ borderRadius: radius.lg, overflow: "hidden" }}>
        <LinearGradient
          colors={[colors.primaryDeep, colors.primarySolid, colors.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22 }}
        >
          <Text style={{ color: "rgba(255,255,255,0.75)", fontWeight: "700" }}>
            Total saved everywhere
          </Text>
          <Display size={40} weight="black" style={{ color: "#fff", marginTop: 6 }}>
            {fmt(totalInSusu + totalSaved)}
          </Display>
          <View style={{ flexDirection: "row", gap: 28, marginTop: 16 }}>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                In susu
              </Text>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
                {fmt(totalInSusu)}
              </Text>
            </View>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                In goals
              </Text>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
                {fmt(totalSaved)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      {data.displayCurrency === "USD" && (
        <Text style={{ color: colors.faint, fontSize: 12, marginTop: 8 }}>
          Converted at GH₵{data.usdRate} = $1
        </Text>
      )}

      {/* Susu circles */}
      <View style={{ marginTop: 26 }}>
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
                  <Display size={18} weight="semi">
                    {c.name}
                  </Display>
                  <Badge
                    text={complete ? "Cycle done" : relativeDue(due)}
                    tone={complete ? "green" : "gold"}
                  />
                </View>
                <Text style={{ color: colors.muted, marginTop: 4 }}>
                  Pot {fmt(potSize(c))} · {c.members.length} members
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
      <View style={{ marginTop: 14 }}>
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
                  <Display size={16} weight="semi">
                    {g.name}
                  </Display>
                  <Text style={{ color: colors.muted }}>
                    {fmt(saved)} / {fmt(g.target)}
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
