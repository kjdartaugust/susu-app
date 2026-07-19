import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Button, Card, Display, Field } from "../ui";
import { confirm, notify } from "../dialog";
import { CURRENCY_LABEL, formatMoney } from "../logic";
import { Currency } from "../types";

export default function Settings() {
  const { data, nameOverride, setName, setDisplayCurrency, setUsdRate, logout } =
    useStore();
  const [name, setLocalName] = useState(nameOverride);
  const [rate, setRate] = useState(String(data.usdRate));

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      <Display size={30} weight="black" style={{ marginBottom: 18, marginTop: 6 }}>
        Settings
      </Display>

      {/* Currency */}
      <Card>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
          Currency
        </Text>
        <Text style={{ color: colors.muted, marginTop: 4, marginBottom: 12 }}>
          Show all amounts in Ghana Cedis or US Dollars.
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["GHS", "USD"] as Currency[]).map((c) => {
            const active = data.displayCurrency === c;
            return (
              <Pressable
                key={c}
                onPress={() => setDisplayCurrency(c)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: radius.sm,
                  alignItems: "center",
                  backgroundColor: active ? colors.primarySolid : colors.cardAlt,
                  borderWidth: 1,
                  borderColor: active ? colors.primarySolid : colors.border,
                }}
              >
                <Text
                  style={{
                    color: active ? "#fff" : colors.text,
                    fontWeight: "800",
                    fontSize: 16,
                  }}
                >
                  {c === "GHS" ? "GH₵ Cedis" : "$ Dollars"}
                </Text>
                <Text
                  style={{
                    color: active ? "rgba(255,255,255,0.75)" : colors.muted,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {CURRENCY_LABEL[c]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 16 }} />
        <Field
          label="Exchange rate — GH₵ per US$1"
          value={rate}
          onChangeText={setRate}
          keyboardType="numeric"
          placeholder="15.5"
        />
        <Button
          title="Save rate"
          small
          onPress={() => {
            const r = Number(rate);
            if (r > 0) {
              setUsdRate(r);
              notify("Saved", `Using GH₵${r} = $1.`);
            }
          }}
        />
        <Text style={{ color: colors.faint, fontSize: 12, marginTop: 10 }}>
          Example: {formatMoney(100, "GHS", data.usdRate)} ={" "}
          {formatMoney(100, "USD", Number(rate) > 0 ? Number(rate) : data.usdRate)}
        </Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Field
          label="Your name"
          value={name}
          onChangeText={setLocalName}
          // Placeholder, not value: an empty override means "use the name on
          // the account", and pre-filling the box would save the greeting text
          // back as a real name.
          placeholder={data.name}
        />
        <Button
          title="Save name"
          small
          onPress={() => {
            setName(name.trim());
            notify("Saved", "Your name has been updated.");
          }}
        />
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
          About Susu
        </Text>
        <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 21 }}>
          Susu is a traditional West African group savings method. Everyone
          contributes a fixed amount each round, and one member collects the
          whole pot in turn until everyone has received once. This app keeps
          track of who has paid and whose turn it is, synced to your account so
          you can reach your circles from any phone.
        </Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
          Account
        </Text>
        <Text style={{ color: colors.muted, marginTop: 6, marginBottom: 12 }}>
          Your circles and goals are saved to your account and sync across your
          devices.
        </Text>
        <Button
          title="Sign out"
          variant="danger"
          onPress={() =>
            confirm({
              title: "Sign out?",
              message: "You can sign back in anytime.",
              confirmLabel: "Sign out",
              destructive: true,
              onConfirm: () => {
                logout().catch((e) =>
                  notify(
                    "Couldn't sign out",
                    e instanceof Error ? e.message : "Please try again."
                  )
                );
              },
            })
          }
        />
      </Card>

      <Text
        style={{
          color: colors.faint,
          textAlign: "center",
          marginTop: 24,
          fontSize: 13,
        }}
      >
        Susu · v1.0 · made in Ghana 🇬🇭
      </Text>
    </ScrollView>
  );
}
