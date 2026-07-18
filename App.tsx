import React, { useState } from "react";
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

type Tab = "home" | "circles" | "goals" | "settings";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "circles", label: "Circles", icon: "◍" },
  { key: "goals", label: "Goals", icon: "◎" },
  { key: "settings", label: "More", icon: "⋯" },
];

function Shell() {
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>("home");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (!ready) return <Loader />;

  let content: React.ReactNode;
  if (creating) {
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
      />
    );
  } else if (tab === "circles") {
    content = (
      <Circles
        onOpenCircle={(id) => setDetailId(id)}
        onNew={() => setCreating(true)}
      />
    );
  } else if (tab === "goals") {
    content = <Goals />;
  } else {
    content = <Settings />;
  }

  const hideTabBar = creating;

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
