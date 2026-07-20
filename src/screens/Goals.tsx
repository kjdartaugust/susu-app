import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  const [depMode, setDepMode] = useState<"add" | "withdraw">("add");

  const goalValid = gName.trim().length > 0 && Number(gTarget) > 0;
  const depValid = Number(depAmt) > 0;

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
    if (!depOpen || !depValid) return;
    // The amount is always entered positive; the mode decides the sign, so
    // nobody has to know to type a minus.
    const signed = Math.abs(Number(depAmt)) * (depMode === "withdraw" ? -1 : 1);
    try {
      await addGoalTxn(
        depOpen,
        toBaseGhs(signed, disp, data.usdRate),
        depNote.trim() || (depMode === "withdraw" ? "Withdrawal" : "Deposit")
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
        const pct = g.target > 0 ? Math.min(1, saved / g.target) : 0;
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginTop: 8,
                marginBottom: 10,
                gap: 12,
              }}
            >
              <Display size={24} weight="bold">
                {fmt(saved)}
              </Display>
              <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 3 }}>
                of {fmt(g.target)} · {Math.round(pct * 100)}%
              </Text>
            </View>
            <Progress value={pct} />
            <Text style={{ color: colors.faint, fontSize: 12, marginTop: 6 }}>
              {done
                ? "Goal reached"
                : `${fmt(Math.max(0, g.target - saved))} to go`}
            </Text>
            <View style={{ marginTop: 14 }}>
              <Button
                title="+ Add money"
                variant="gold"
                small
                onPress={() => {
                  // Fresh sheet each time — otherwise it reopens still set to
                  // "withdraw" from a previous visit.
                  setDepMode("add");
                  setDepAmt("");
                  setDepNote("");
                  setDepOpen(g.id);
                }}
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
          <Button title="Create goal" onPress={createGoal} disabled={!goalValid} />
        </Sheet>
      </Modal>

      {/* Deposit modal */}
      <Modal visible={!!depOpen} transparent animationType="slide">
        <Sheet
          onClose={() => setDepOpen(null)}
          title={depMode === "withdraw" ? "Take money out" : "Add money"}
        >
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {(["add", "withdraw"] as const).map((m) => {
              const active = depMode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setDepMode(m)}
                  style={{
                    flex: 1,
                    paddingVertical: 11,
                    borderRadius: radius.sm,
                    alignItems: "center",
                    backgroundColor: active ? colors.primarySolid : colors.cardAlt,
                    borderWidth: 1,
                    borderColor: active ? colors.primarySolid : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: active ? "#fff" : colors.muted,
                      fontWeight: "800",
                      fontSize: 14,
                    }}
                  >
                    {m === "add" ? "Add" : "Withdraw"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Field
            label={`Amount (${sym})`}
            placeholder="100"
            keyboardType="numeric"
            value={depAmt}
            onChangeText={setDepAmt}
          />
          <Field
            label="Note (optional)"
            placeholder={depMode === "withdraw" ? "Emergency" : "Susu payout"}
            value={depNote}
            onChangeText={setDepNote}
          />
          <Button
            title={depMode === "withdraw" ? "Withdraw" : "Add money"}
            variant="gold"
            onPress={deposit}
            disabled={!depValid}
          />
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
    // Keyboard-aware: these sheets sit at the bottom of the screen and are all
    // text inputs, so on iOS the keyboard would otherwise cover the very field
    // being typed into.
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: "flex-end" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
          width: "100%",
          maxWidth: 460,
          alignSelf: "center",
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
    </KeyboardAvoidingView>
  );
}
