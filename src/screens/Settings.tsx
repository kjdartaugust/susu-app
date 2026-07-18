import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors, radius } from "../theme";
import { Button, Card, Display, Field } from "../ui";
import { CURRENCY_LABEL, formatMoney } from "../logic";
import { Currency } from "../types";

export default function Settings() {
  const { data, setName, setDisplayCurrency, setUsdRate, reset } = useStore();
  const [name, setLocalName] = useState(data.name);
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
              Alert.alert("Saved", `Using GH₵${r} = $1.`);
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
          placeholder="Your name"
        />
        <Button
          title="Save name"
          small
          onPress={() => {
            setName(name.trim() || "Me");
            Alert.alert("Saved", "Your name has been updated.");
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
          track of who has paid and whose turn it is — all stored privately on
          your phone.
        </Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
          Data
        </Text>
        <Text style={{ color: colors.muted, marginTop: 6, marginBottom: 12 }}>
          Everything is stored offline on this device. Nothing is uploaded.
        </Text>
        <Button
          title="Reset to sample data"
          variant="danger"
          onPress={() =>
            Alert.alert(
              "Reset everything?",
              "This clears your circles and goals and restores the sample data.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: reset },
              ]
            )
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
