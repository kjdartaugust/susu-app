import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Button, Card, Field, Progress } from "../ui";
import { formatMoney, goalSaved } from "../logic";

export default function Goals() {
  const { data, addGoal, addGoalTxn, deleteGoal } = useStore();
  const cur = data.currency;
  const [newOpen, setNewOpen] = useState(false);
  const [gName, setGName] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [depOpen, setDepOpen] = useState<string | null>(null);
  const [depAmt, setDepAmt] = useState("");
  const [depNote, setDepNote] = useState("");

  function createGoal() {
    if (!gName.trim() || Number(gTarget) <= 0) return;
    addGoal(gName.trim(), Number(gTarget));
    setGName("");
    setGTarget("");
    setNewOpen(false);
  }

  function deposit() {
    if (!depOpen || !Number(depAmt)) return;
    addGoalTxn(depOpen, Number(depAmt), depNote.trim() || "Deposit");
    setDepAmt("");
    setDepNote("");
    setDepOpen(null);
  }

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
          Savings Goals
        </Text>
        <Button title="+ New" onPress={() => setNewOpen(true)} small />
      </View>

      {data.goals.length === 0 && (
        <Card>
          <Text style={{ color: colors.muted }}>
            Set a target and stash money toward it — school fees, rent, a phone.
          </Text>
        </Card>
      )}

      {data.goals.map((g) => {
        const saved = goalSaved(g);
        const pct = Math.min(1, saved / g.target);
        const done = saved >= g.target;
        return (
          <Card key={g.id} style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 17 }}>
                {g.name} {done ? "🎉" : ""}
              </Text>
              <Pressable
                onPress={() =>
                  Alert.alert("Delete goal?", g.name, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => deleteGoal(g.id),
                    },
                  ])
                }
              >
                <Text style={{ color: colors.muted, fontSize: 20 }}>⋯</Text>
              </Pressable>
            </View>
            <Text style={{ color: colors.muted, marginTop: 4, marginBottom: 10 }}>
              {formatMoney(saved, cur)} of {formatMoney(g.target, cur)} ·{" "}
              {Math.round(pct * 100)}%
            </Text>
            <Progress value={pct} />
            <View style={{ marginTop: 14 }}>
              <Button
                title="+ Add money"
                variant="gold"
                small
                onPress={() => setDepOpen(g.id)}
              />
            </View>
            {g.txns.length > 0 && (
              <View style={{ marginTop: 12, gap: 6 }}>
                {g.txns.slice(0, 3).map((t) => (
                  <View
                    key={t.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      {t.note}
                    </Text>
                    <Text
                      style={{
                        color: t.amount >= 0 ? colors.primary : colors.danger,
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      {t.amount >= 0 ? "+" : ""}
                      {formatMoney(t.amount, cur)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        );
      })}

      {/* New goal modal */}
      <Modal visible={newOpen} transparent animationType="slide">
        <Sheet onClose={() => setNewOpen(false)} title="New goal">
          <Field
            label="Goal name"
            placeholder="School Fees"
            value={gName}
            onChangeText={setGName}
          />
          <Field
            label={`Target (${cur})`}
            placeholder="2000"
            keyboardType="numeric"
            value={gTarget}
            onChangeText={setGTarget}
          />
          <Button title="Create goal" onPress={createGoal} />
        </Sheet>
      </Modal>

      {/* Deposit modal */}
      <Modal visible={!!depOpen} transparent animationType="slide">
        <Sheet onClose={() => setDepOpen(null)} title="Add money">
          <Field
            label={`Amount (${cur}) — use minus for withdrawal`}
            placeholder="100"
            keyboardType="numbers-and-punctuation"
            value={depAmt}
            onChangeText={setDepAmt}
          />
          <Field
            label="Note (optional)"
            placeholder="Susu payout"
            value={depNote}
            onChangeText={setDepNote}
          />
          <Button title="Save" variant="gold" onPress={deposit} />
        </Sheet>
      </Modal>
    </ScrollView>
  );
}

function Sheet({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <View style={{ flex: 1, justifyContent: "flex-end" }}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          padding: 20,
          paddingBottom: 40,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
            {title}
          </Text>
          <Pressable onPress={onClose}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>Close</Text>
          </Pressable>
        </View>
        {children}
      </View>
    </View>
  );
}
