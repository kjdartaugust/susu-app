import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors } from "../theme";
import { Avatar, Badge, Button, Card } from "../ui";
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
}: {
  onOpenCircle: (id: string) => void;
  onNew: () => void;
}) {
  const { data } = useStore();
  const cur = data.currency;

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
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800" }}>
          Susu Circles
        </Text>
        <Button title="+ New" onPress={onNew} small />
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
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
                  {c.name}
                </Text>
                <Badge
                  text={complete ? "Complete" : relativeDue(due)}
                  tone={complete ? "green" : "gold"}
                />
              </View>
              <Text style={{ color: colors.muted, marginTop: 4 }}>
                {formatMoney(c.contribution, cur)} each · pot{" "}
                {formatMoney(potSize(c), cur)}
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
