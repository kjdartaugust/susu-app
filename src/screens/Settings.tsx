import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors } from "../theme";
import { Button, Card, Field } from "../ui";

export default function Settings() {
  const { data, setName, reset } = useStore();
  const [name, setLocalName] = useState(data.name);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 28,
          fontWeight: "800",
          marginBottom: 16,
          marginTop: 8,
        }}
      >
        Settings
      </Text>

      <Card>
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
          color: colors.muted,
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
