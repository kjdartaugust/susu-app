import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  useFonts,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import { StoreProvider, useStore } from "./src/store";
import { colors } from "./src/theme";
import { Loader } from "./src/ui";
import Home from "./src/screens/Home";
import Circles from "./src/screens/Circles";
import CircleDetail from "./src/screens/CircleDetail";
import NewCircle from "./src/screens/NewCircle";
import Goals from "./src/screens/Goals";
import Settings from "./src/screens/Settings";
import Auth from "./src/screens/Auth";
import Join from "./src/screens/Join";
import Welcome from "./src/screens/Welcome";

type Tab = "home" | "circles" | "goals" | "settings";

// A shared invite link opens the app at ?invite=TOKEN (web). On native this is
// empty; deep-link handling can fill it later.
const INITIAL_INVITE =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("invite") ?? ""
    : "";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "circles", label: "Circles", icon: "◍" },
  { key: "goals", label: "Goals", icon: "◎" },
  { key: "settings", label: "More", icon: "⋯" },
];

function SignedOut() {
  // Invite links carry intent to join, so skip the welcome and go straight to
  // sign-up; otherwise show the welcome front door first.
  const [view, setView] = useState<"welcome" | "auth">(
    INITIAL_INVITE ? "auth" : "welcome"
  );
  const [mode, setMode] = useState<"login" | "signup">("signup");

  if (view === "auth")
    return (
      <Auth
        initialMode={mode}
        onBack={INITIAL_INVITE ? undefined : () => setView("welcome")}
      />
    );
  return (
    <Welcome
      onGetStarted={() => {
        setMode("signup");
        setView("auth");
      }}
      onSignIn={() => {
        setMode("login");
        setView("auth");
      }}
    />
  );
}

function Shell() {
  const { status } = useStore();
  const [tab, setTab] = useState<Tab>("home");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const invitedRef = useRef(false);

  // Once signed in, if we opened from an invite link, jump straight to Join.
  useEffect(() => {
    if (status === "ready" && INITIAL_INVITE && !invitedRef.current) {
      invitedRef.current = true;
      setInviteCode(INITIAL_INVITE);
      setJoining(true);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [status]);

  if (status === "loading") return <Loader />;
  if (status === "signedOut")
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <SignedOut />
      </SafeAreaView>
    );

  let content: React.ReactNode;
  if (joining) {
    content = (
      <Join
        initialCode={inviteCode}
        onCancel={() => setJoining(false)}
        onJoined={() => {
          setJoining(false);
          setTab("circles");
        }}
      />
    );
  } else if (creating) {
    content = (
      <NewCircle
        onCancel={() => setCreating(false)}
        onDone={(id) => {
          setCreating(false);
          setDetailId(id);
          setTab("circles");
        }}
      />
    );
  } else if (detailId) {
    content = (
      <CircleDetail circleId={detailId} onBack={() => setDetailId(null)} />
    );
  } else if (tab === "home") {
    content = (
      <Home
        onOpenCircle={(id) => setDetailId(id)}
        onGoTab={(t) => setTab(t as Tab)}
        onNew={() => setCreating(true)}
        onJoin={() => {
          setInviteCode("");
          setJoining(true);
        }}
      />
    );
  } else if (tab === "circles") {
    content = (
      <Circles
        onOpenCircle={(id) => setDetailId(id)}
        onNew={() => setCreating(true)}
        onJoin={() => {
          setInviteCode("");
          setJoining(true);
        }}
      />
    );
  } else if (tab === "goals") {
    content = <Goals />;
  } else {
    content = <Settings />;
  }

  const hideTabBar = creating || joining;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={{ flex: 1 }}>{content}</View>

      {!hideTabBar && (
        <View style={styles.tabbar}>
          {TABS.map((t) => {
            const active = !detailId && tab === t.key;
            return (
              <Pressable
                key={t.key}
                style={styles.tab}
                onPress={() => {
                  setDetailId(null);
                  setTab(t.key);
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: active ? colors.primary : colors.muted,
                  }}
                >
                  {t.icon}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    marginTop: 2,
                    color: active ? colors.primary : colors.muted,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  // Never block the app on fonts — if they error, fall back to system serif.
  const ready = fontsLoaded || !!fontError;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        {ready ? <Shell /> : <Loader />}
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabbar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingTop: 8,
    paddingBottom: 6,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
});
