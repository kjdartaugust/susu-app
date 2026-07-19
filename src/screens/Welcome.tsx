import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { Button, Display } from "../ui";
import CircleRing from "../components/CircleRing";

// The front door when signed out. The live ring carries the pitch — it shows a
// pot moving seat to seat, which is the whole product — so the copy stays to
// one line and the screen fills top to bottom instead of clumping.
export default function Welcome({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void;
  onSignIn: () => void;
}) {
  const [showHow, setShowHow] = useState(false);

  if (showHow) return <HowItWorks onBack={() => setShowHow(false)} onGetStarted={onGetStarted} />;

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 28,
        justifyContent: "space-between",
        // Phone-shaped even on a wide browser, so the web preview reads like
        // the app rather than a stretched page.
        width: "100%",
        maxWidth: 460,
        alignSelf: "center",
      }}
    >
      <View>
        <Display size={46} weight="black">
          Susu
        </Display>
        <Text
          style={{
            color: colors.muted,
            fontSize: 17,
            lineHeight: 24,
            marginTop: 6,
            maxWidth: 300,
          }}
        >
          Save together, in turns.
        </Text>
      </View>

      <View style={{ alignItems: "center", paddingVertical: 28 }}>
        <CircleRing size={272} />
      </View>

      <View>
        <View style={{ gap: 10 }}>
          <Button title="Get started" onPress={onGetStarted} />
          <Button title="See how it works" variant="ghost" onPress={() => setShowHow(true)} />
        </View>

        <Pressable onPress={onSignIn} style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const STEPS = [
  {
    t: "Everyone chips in",
    d: "Each round, every member contributes the same amount.",
  },
  {
    t: "One person collects",
    d: "The whole pot goes to one member — and the turn rotates each round.",
  },
  {
    t: "Until everyone's had a turn",
    d: "It keeps going until each member has collected the pot once.",
  },
];

/** The explainer. A connected timeline, not three stacked cards. */
function HowItWorks({
  onBack,
  onGetStarted,
}: {
  onBack: () => void;
  onGetStarted: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 44,
        width: "100%",
        maxWidth: 460,
        alignSelf: "center",
      }}
    >
      <Pressable onPress={onBack} hitSlop={10} style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}>
          ‹ Back
        </Text>
      </Pressable>

      <Display size={32} weight="black">
        How susu works
      </Display>
      <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 22, fontSize: 15 }}>
        A savings group that takes turns — how millions already save. This just
        keeps it organised.
      </Text>

      <View style={{ alignItems: "center", marginTop: 28, marginBottom: 8 }}>
        <CircleRing size={220} showCaption={false} />
      </View>

      <View style={{ marginTop: 24 }}>
        {STEPS.map((s, i) => (
          <View key={s.t} style={{ flexDirection: "row", gap: 16 }}>
            {/* spine: number + the line connecting it to the next step */}
            <View style={{ alignItems: "center", width: 32 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.primarySoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.displayBold,
                    color: colors.primary,
                    fontSize: 15,
                  }}
                >
                  {i + 1}
                </Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={{ flex: 1, width: 1, backgroundColor: colors.hairline }} />
              )}
            </View>

            <View style={{ flex: 1, paddingBottom: i < STEPS.length - 1 ? 26 : 0 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16.5 }}>
                {s.t}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 21 }}>
                {s.d}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={{ color: colors.faint, marginTop: 28, marginBottom: 18, lineHeight: 21 }}>
        Susu tracks who's paid and whose turn it is, and lets you invite your
        whole group so everyone sees the same thing.
      </Text>
      <Button title="Get started" onPress={onGetStarted} />
    </ScrollView>
  );
}
