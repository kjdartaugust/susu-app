import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Button, Card, Display, Field } from "../ui";
import { notify } from "../dialog";
import { parseCircle as parseCircleApi } from "../api";
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

  // Describe-it shortcut. This only fills the fields in — the user still
  // reviews everything and taps Create, so a bad parse costs an edit, not a
  // wrong circle.
  const [describing, setDescribing] = useState(false);
  const [description, setDescription] = useState("");
  const [parsing, setParsing] = useState(false);

  async function applyDescription() {
    if (!description.trim() || parsing) return;
    setParsing(true);
    try {
      const c = await parseCircleApi(description);
      if (c.name) setName(c.name);
      if (c.contribution > 0) setAmount(String(c.contribution));
      setFreq(c.frequency);
      if (c.members.length) {
        // Keep the organiser first, exactly like the blank form does — a
        // description usually names the *others* ("with Ama, Kofi…"), and the
        // owner's slot is position 0 when the circle is created, so they must
        // be in the list or they end up absent from their own circle.
        const me = data.name.trim();
        const others = c.members.filter(
          (m) => m.trim().toLowerCase() !== me.toLowerCase()
        );
        const ordered = me ? [me, ...others] : c.members;
        setMembersText(ordered.join("\n") + "\n");
      }
      setDescribing(false);
      setDescription("");
      if (c.missing.length)
        notify(
          "Filled in what I could",
          `Still needs: ${c.missing.join(", ")}.`
        );
    } catch (e) {
      notify(
        "Couldn't read that",
        e instanceof Error ? e.message : "Try rewording it."
      );
    } finally {
      setParsing(false);
    }
  }

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
      notify(
        "Couldn't create circle",
        e instanceof Error ? e.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    // Wraps the scroller so the on-screen keyboard pushes content up instead
    // of covering the field being typed into.
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

        {describing ? (
          <Card style={{ marginBottom: 14, borderColor: colors.primarySoft }}>
            <Field
              label="Describe your circle"
              placeholder="weekly 200 cedis with Ama, Kofi, Yaa and Abena"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ minHeight: 76, textAlignVertical: "top" }}
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={parsing ? "Reading…" : "Fill in the form"}
                  onPress={applyDescription}
                  disabled={parsing || !description.trim()}
                  small
                />
              </View>
              <Button
                title="Cancel"
                variant="ghost"
                small
                onPress={() => setDescribing(false)}
              />
            </View>
            <Text style={{ color: colors.faint, fontSize: 12, marginTop: 10 }}>
              You&apos;ll get to check everything before it&apos;s created.
            </Text>
          </Card>
        ) : (
          <Pressable
            onPress={() => setDescribing(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 12,
              marginBottom: 14,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 15 }}>✧</Text>
            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>
              Describe it instead
            </Text>
          </Pressable>
        )}

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
    </KeyboardAvoidingView>
  );
}
