import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { colors } from "../theme";
import { Button, Card, Display, Field } from "../ui";

// First screen when signed out. Login/signup against the shared Dola backend;
// on success the store flips to "ready" and the app renders.
export default function Auth({
  initialMode = "signup",
  onBack,
}: {
  initialMode?: "login" | "signup";
  onBack?: () => void;
}) {
  const { login, signup } = useStore();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";
  const valid =
    email.trim().length > 3 &&
    password.length >= 6 &&
    (!isSignup || fullName.trim().length > 0);

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (isSignup) {
        await signup({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
        });
      } else {
        await login({ email: email.trim().toLowerCase(), password });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {onBack && (
          <Pressable onPress={onBack} style={{ marginBottom: 14 }}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}>
              ‹ Back
            </Text>
          </Pressable>
        )}
        <Display size={34} weight="black">
          {isSignup ? "Create your account" : "Welcome back"}
        </Display>
        <Text style={{ color: colors.muted, marginTop: 8, marginBottom: 28, fontSize: 15, lineHeight: 21 }}>
          {isSignup
            ? "Save your circles and reach them from any phone."
            : "Sign in to your circles and goals."}
        </Text>

        <Card>
          {isSignup && (
            <Field
              label="Your name"
              placeholder="Ama Mensah"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}
          <Field
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Field
            label="Password"
            placeholder={isSignup ? "At least 6 characters" : "Your password"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {error && (
            <Text style={{ color: colors.danger, marginBottom: 12, fontSize: 14 }}>
              {error}
            </Text>
          )}

          <Button
            title={busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            onPress={submit}
            disabled={!valid || busy}
          />
        </Card>

        <Pressable
          onPress={() => {
            setMode(isSignup ? "login" : "signup");
            setError(null);
          }}
          style={{ marginTop: 20, alignItems: "center" }}
        >
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            {isSignup ? "Already have an account? " : "New here? "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>
              {isSignup ? "Sign in" : "Create one"}
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
