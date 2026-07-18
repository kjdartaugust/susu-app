import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme";
import { Button, Card, Display } from "../ui";

// The front door when signed out — a warm intro instead of a bare form. Leads
// to sign-up/sign-in, with a "how it works" peek so people get it before
// committing.
export default function Welcome({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void;
  onSignIn: () => void;
}) {
  const [showHow, setShowHow] = useState(false);

  if (showHow) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40, paddingBottom: 60 }}>
        <Pressable onPress={() => setShowHow(false)} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}>
            ‹ Back
          </Text>
        </Pressable>
        <Display size={30} weight="black">
          How susu works
        </Display>
        <Text style={{ color: colors.muted, marginTop: 8, marginBottom: 22, lineHeight: 21 }}>
          A susu is a savings group that takes turns. It's how millions already
          save — this just keeps it organised.
        </Text>

        {[
          {
            n: "1",
            t: "Everyone chips in",
            d: "Each round, every member contributes the same amount.",
          },
          {
            n: "2",
            t: "One person collects",
            d: "The whole pot goes to one member — and the turn rotates each round.",
          },
          {
            n: "3",
            t: "Until everyone's had a turn",
            d: "It keeps going until each member has collected the pot once.",
          },
        ].map((s) => (
          <Card key={s.n} style={{ marginBottom: 12, flexDirection: "row", gap: 14 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 16 }}>
                {s.n}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                {s.t}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 3, lineHeight: 20 }}>
                {s.d}
              </Text>
            </View>
          </Card>
        ))}

        <Text style={{ color: colors.muted, marginTop: 10, marginBottom: 16, lineHeight: 20 }}>
          Susu keeps track of who's paid and whose turn it is, and lets you
          invite your whole group so everyone sees the same thing.
        </Text>
        <Button title="Get started" onPress={onGetStarted} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 48, paddingBottom: 40 }}>
      <View style={{ borderRadius: radius.lg, overflow: "hidden", marginBottom: 28 }}>
        <LinearGradient
          colors={[colors.primaryDeep, colors.primarySolid, colors.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 26, minHeight: 190, justifyContent: "flex-end" }}
        >
          <Display size={44} weight="black" style={{ color: "#fff" }}>
            Susu
          </Display>
          <Text
            style={{
              color: "rgba(255,255,255,0.92)",
              marginTop: 10,
              fontSize: 17,
              lineHeight: 24,
            }}
          >
            Save together, in turns. The trusted way your group already saves —
            now on your phone.
          </Text>
        </LinearGradient>
      </View>

      {[
        { t: "Run your circle", d: "Track who's paid and whose turn it is to collect." },
        { t: "Invite your group", d: "Everyone joins and sees the same circle, live." },
        { t: "Reach your goals", d: "Set targets and save toward school fees, rent, more." },
      ].map((f) => (
        <View
          key={f.t}
          style={{ flexDirection: "row", gap: 12, marginBottom: 16, alignItems: "flex-start" }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              marginTop: 7,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
              {f.t}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 2, lineHeight: 20 }}>
              {f.d}
            </Text>
          </View>
        </View>
      ))}

      <View style={{ marginTop: 14, gap: 10 }}>
        <Button title="Get started" onPress={onGetStarted} />
        <Button title="See how it works" variant="ghost" onPress={() => setShowHow(true)} />
      </View>

      <Pressable onPress={onSignIn} style={{ marginTop: 22, alignItems: "center" }}>
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          Already have an account?{" "}
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign in</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
