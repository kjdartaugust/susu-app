import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Button, Card, Display, Field } from "../ui";
import { CURRENCY_SYMBOL, FREQ_LABEL, toBaseGhs, uid } from "../logic";
import { Frequency } from "../types";

const FREQS: Frequency[] = ["weekly", "biweekly", "monthly"];

export default function NewCircle({
  onDone,
  onCancel,
}: {
  onDone: (id: string) => void;
  onCancel: () => void;
}) {
  const { data, addCircle } = useStore();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [freq, setFreq] = useState<Frequency>("weekly");
  const [membersText, setMembersText] = useState(data.name + "\n");

  const members = membersText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const [busy, setBusy] = useState(false);
  const valid = name.trim() && Number(amount) > 0 && members.length >= 2;

  async function create() {
    if (!valid || busy) return;
    setBusy(true);
    try {
      const id = await addCircle({
        name: name.trim(),
        contribution: toBaseGhs(
          Number(amount),
          data.displayCurrency,
          data.usdRate
        ),
        frequency: freq,
        startDate: new Date().toISOString(),
        members: members.map((n) => ({ id: uid(), name: n })),
      });
      if (id) onDone(id);
    } catch (e) {
      Alert.alert(
        "Couldn't create circle",
        e instanceof Error ? e.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
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
          New Circle
        </Display>
        <Pressable onPress={onCancel}>
          <Text style={{ color: colors.muted, fontSize: 16 }}>Cancel</Text>
        </Pressable>
      </View>

      <Card>
        <Field
          label="Circle name"
          placeholder="e.g. Market Ladies Susu"
          value={name}
          onChangeText={setName}
        />
        <Field
          label={`Contribution per round (${CURRENCY_SYMBOL[data.displayCurrency]})`}
          placeholder="100"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text
          style={{
            color: colors.muted,
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 6,
          }}
        >
          How often
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          {FREQS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFreq(f)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: radius.sm,
                alignItems: "center",
                backgroundColor: freq === f ? colors.primary : colors.cardAlt,
                borderWidth: 1,
                borderColor: freq === f ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: freq === f ? "#08130B" : colors.text,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                {FREQ_LABEL[f]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Field
          label="Members (one per line, in payout order)"
          placeholder={"You\nAma\nKwame"}
          value={membersText}
          onChangeText={setMembersText}
          multiline
          numberOfLines={5}
          style={{ minHeight: 120, textAlignVertical: "top" }}
        />
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {members.length} members · order = who collects first, second, …
        </Text>
      </Card>

      <View style={{ marginTop: 18 }}>
        <Button
          title={busy ? "Creating…" : "Create circle"}
          onPress={create}
          disabled={!valid || busy}
        />
      </View>
    </ScrollView>
  );
}
