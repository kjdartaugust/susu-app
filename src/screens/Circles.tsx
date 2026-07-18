import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors } from "../theme";
import { Avatar, Badge, Button, Card, Display } from "../ui";
import {
  currentCycleIndex,
  formatMoney,
  membersPaidThisCycle,
  nextCycleDate,
  potSize,
  recipientForCycle,
  relativeDue,
} from "../logic";

export default function Circles({
  onOpenCircle,
  onNew,
  onJoin,
}: {
  onOpenCircle: (id: string) => void;
  onNew: () => void;
  onJoin: () => void;
}) {
  const { data } = useStore();
  const fmt = (n: number) => formatMoney(n, data.displayCurrency, data.usdRate);

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
          marginBottom: 16,
          marginTop: 8,
        }}
      >
        <Display size={30} weight="black">
          Susu Circles
        </Display>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title="Join" variant="ghost" onPress={onJoin} small />
          <Button title="+ New" onPress={onNew} small />
        </View>
      </View>

      {data.circles.length === 0 && (
        <Card>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
            Start your first circle
          </Text>
          <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>
            A susu circle is a group where everyone contributes the same amount
            each round, and one member collects the whole pot in turn.
          </Text>
          <View style={{ marginTop: 14 }}>
            <Button title="Create a circle" onPress={onNew} />
          </View>
        </Card>
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
                <Display size={19} weight="semi">
                  {c.name}
                </Display>
                <Badge
                  text={complete ? "Complete" : relativeDue(due)}
                  tone={complete ? "green" : "gold"}
                />
              </View>
              <Text style={{ color: colors.muted, marginTop: 4 }}>
                {fmt(c.contribution)} each · pot {fmt(potSize(c))}
              </Text>

              <View style={{ flexDirection: "row", marginTop: 14 }}>
                {c.members.slice(0, 6).map((m, i) => (
                  <View key={m.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                    <Avatar name={m.name} size={30} />
                  </View>
                ))}
                {c.members.length > 6 && (
                  <View
                    style={{
                      marginLeft: -8,
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: colors.cardAlt,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      +{c.members.length - 6}
                    </Text>
                  </View>
                )}
              </View>

              {recipient && (
                <Text style={{ color: colors.muted, marginTop: 12 }}>
                  This round →{" "}
                  <Text style={{ color: colors.gold, fontWeight: "700" }}>
                    {recipient.name}
                  </Text>{" "}
                  · {paidN}/{c.members.length} paid
                </Text>
              )}
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
