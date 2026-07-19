import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Button, Card, CurrencyToggle, Display, Field, Progress } from "../ui";
import { confirm, notify } from "../dialog";
import { CURRENCY_SYMBOL, formatMoney, goalSaved, toBaseGhs } from "../logic";
import EmptyState from "../components/EmptyState";

export default function Goals() {
  const { data, addGoal, addGoalTxn, deleteGoal } = useStore();
  const disp = data.displayCurrency;
  const sym = CURRENCY_SYMBOL[disp];
  const fmt = (n: number) => formatMoney(n, disp, data.usdRate);
  const [newOpen, setNewOpen] = useState(false);
  const [gName, setGName] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [depOpen, setDepOpen] = useState<string | null>(null);
  const [depAmt, setDepAmt] = useState("");
  const [depNote, setDepNote] = useState("");

  async function createGoal() {
    if (!gName.trim() || Number(gTarget) <= 0) return;
    try {
      await addGoal(gName.trim(), toBaseGhs(Number(gTarget), disp, data.usdRate));
      setGName("");
      setGTarget("");
      setNewOpen(false);
    } catch (e) {
      notify(
        "Couldn't create goal",
        e instanceof Error ? e.message : "Please try again."
      );
    }
  }

  async function deposit() {
    if (!depOpen || !Number(depAmt)) return;
    try {
      await addGoalTxn(
        depOpen,
        toBaseGhs(Number(depAmt), disp, data.usdRate),
        depNote.trim() || "Deposit"
      );
      setDepAmt("");
      setDepNote("");
      setDepOpen(null);
    } catch (e) {
      notify(
        "Couldn't save",
        e instanceof Error ? e.message : "Please try again."
      );
    }
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
        <Display size={30} weight="black">
          Savings Goals
        </Display>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <CurrencyToggle />
          <Button title="+ New" onPress={() => setNewOpen(true)} small />
        </View>
      </View>

      {data.goals.length === 0 && (
        <EmptyState
          glyph="◎"
          title="No goals yet"
          body="Set a target and stash money toward it — school fees, rent, a new phone."
        >
          <Button title="Add a goal" onPress={() => setNewOpen(true)} />
        </EmptyState>
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
              <Display size={18} weight="semi">
                {g.name} {done ? "🎉" : ""}
              </Display>
              <Pressable
                onPress={() =>
                  confirm({
                    title: "Delete goal?",
                    message: g.name,
                    confirmLabel: "Delete",
                    destructive: true,
                    onConfirm: () => {
                      deleteGoal(g.id).catch((e) =>
                        notify(
                          "Couldn't delete",
                          e instanceof Error ? e.message : "Please try again."
                        )
                      );
                    },
                  })
                }
              >
                <Text style={{ color: colors.muted, fontSize: 20 }}>⋯</Text>
              </Pressable>
            </View>
            <Text style={{ color: colors.muted, marginTop: 4, marginBottom: 10 }}>
              {fmt(saved)} of {fmt(g.target)} · {Math.round(pct * 100)}%
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
                      {fmt(t.amount)}
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
            label={`Target (${sym})`}
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
            label={`Amount (${sym}) — use minus for withdrawal`}
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
