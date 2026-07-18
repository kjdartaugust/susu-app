import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppData, Circle, Currency } from "./types";
import { paidKey } from "./logic";
import * as api from "./api";

// The circles and goals live on the shared Dola backend (see api.ts); only the
// display preferences below are kept on-device. A signed-in user's data follows
// them to any device, which is what makes a circle a real, shared thing.

const PREFS_KEY = "susu.prefs.v1";
export const DEFAULT_USD_RATE = 15.5; // GHS per 1 USD

interface Prefs {
  name: string;
  displayCurrency: Currency;
  usdRate: number;
}
const DEFAULT_PREFS: Prefs = {
  name: "Me",
  displayCurrency: "GHS",
  usdRate: DEFAULT_USD_RATE,
};

// loading = still checking for a saved session; signedOut = show the auth
// screen; ready = we have the user's data.
type Status = "loading" | "signedOut" | "ready";

interface StoreValue {
  data: AppData;
  status: Status;
  // auth
  signup: (i: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<void>;
  login: (i: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  // circles
  addCircle: (c: Omit<Circle, "id" | "paid">) => Promise<string | null>;
  deleteCircle: (id: string) => Promise<void>;
  togglePaid: (
    circleId: string,
    cycleIndex: number,
    memberId: string
  ) => Promise<void>;
  // goals
  addGoal: (name: string, target: number) => Promise<void>;
  addGoalTxn: (goalId: string, amount: number, note: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  // local display prefs
  setName: (name: string) => void;
  setDisplayCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  setUsdRate: (rate: number) => void;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [server, setServer] = useState<api.SusuState>({
    circles: [],
    goals: [],
  });
  const [status, setStatus] = useState<Status>("loading");
  const prefsLoaded = useRef(false);

  // Latest server state, for reads inside stable callbacks (optimistic toggle).
  const serverRef = useRef(server);
  useEffect(() => {
    serverRef.current = server;
  }, [server]);

  // On launch: restore prefs, then resume a saved session if the token still
  // works. A rejected token just drops us to the sign-in screen.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      } catch {
        // ignore — defaults are fine
      }
      prefsLoaded.current = true;

      const token = await api.loadToken();
      if (!token) {
        setStatus("signedOut");
        return;
      }
      try {
        setServer(await api.fetchState());
        setStatus("ready");
      } catch {
        await api.logout();
        setStatus("signedOut");
      }
    })();
  }, []);

  useEffect(() => {
    if (!prefsLoaded.current) return;
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs]);

  const data: AppData = {
    circles: server.circles,
    goals: server.goals,
    displayCurrency: prefs.displayCurrency,
    usdRate: prefs.usdRate,
    name: prefs.name,
  };

  /* ------------------------------------------------------------ auth ---- */

  const signup = useCallback(
    async (i: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
    }) => {
      await api.signup(i);
      setServer(await api.fetchState());
      setStatus("ready");
    },
    []
  );

  const login = useCallback(
    async (i: { email: string; password: string }) => {
      await api.login(i);
      setServer(await api.fetchState());
      setStatus("ready");
    },
    []
  );

  const logout = useCallback(async () => {
    await api.logout();
    setServer({ circles: [], goals: [] });
    setStatus("signedOut");
  }, []);

  const refresh = useCallback(async () => {
    setServer(await api.fetchState());
  }, []);

  /* --------------------------------------------------------- circles ---- */

  const addCircle = useCallback(async (c: Omit<Circle, "id" | "paid">) => {
    const state = await api.createCircle({
      name: c.name,
      contribution: c.contribution,
      frequency: c.frequency,
      startDate: c.startDate,
      members: c.members.map((m) => m.name),
    });
    setServer(state);
    // createCircle returns circles oldest-first, so the new one is last.
    return state.circles.length
      ? state.circles[state.circles.length - 1].id
      : null;
  }, []);

  const deleteCircle = useCallback(async (id: string) => {
    setServer(await api.deleteCircle(id));
  }, []);

  const togglePaid = useCallback(
    async (circleId: string, cycleIndex: number, memberId: string) => {
      const k = paidKey(cycleIndex, memberId);
      const circle = serverRef.current.circles.find((c) => c.id === circleId);
      if (!circle) return;
      const nextPaid = !circle.paid[k];

      // Optimistic: flip the tick immediately, reconcile with the server after.
      setServer((prev) => ({
        ...prev,
        circles: prev.circles.map((c) => {
          if (c.id !== circleId) return c;
          const paid = { ...c.paid };
          if (nextPaid) paid[k] = true;
          else delete paid[k];
          return { ...c, paid };
        }),
      }));

      try {
        setServer(await api.setPaid(circleId, memberId, cycleIndex, nextPaid));
      } catch (e) {
        // Roll back to the truth on failure.
        try {
          setServer(await api.fetchState());
        } catch {
          // offline — leave the optimistic value; next refresh corrects it
        }
        throw e;
      }
    },
    []
  );

  /* ----------------------------------------------------------- goals ---- */

  const addGoal = useCallback(async (name: string, target: number) => {
    setServer(await api.createGoal({ name, target }));
  }, []);

  const addGoalTxn = useCallback(
    async (goalId: string, amount: number, note: string) => {
      setServer(await api.addGoalTxn(goalId, amount, note));
    },
    []
  );

  const deleteGoal = useCallback(async (id: string) => {
    setServer(await api.deleteGoal(id));
  }, []);

  /* ----------------------------------------------------------- prefs ---- */

  const setName = useCallback(
    (name: string) => setPrefs((p) => ({ ...p, name })),
    []
  );
  const setDisplayCurrency = useCallback(
    (c: Currency) => setPrefs((p) => ({ ...p, displayCurrency: c })),
    []
  );
  const toggleCurrency = useCallback(
    () =>
      setPrefs((p) => ({
        ...p,
        displayCurrency: p.displayCurrency === "GHS" ? "USD" : "GHS",
      })),
    []
  );
  const setUsdRate = useCallback(
    (rate: number) =>
      setPrefs((p) => ({ ...p, usdRate: rate > 0 ? rate : p.usdRate })),
    []
  );

  return (
    <StoreCtx.Provider
      value={{
        data,
        status,
        signup,
        login,
        logout,
        refresh,
        addCircle,
        deleteCircle,
        togglePaid,
        addGoal,
        addGoalTxn,
        deleteGoal,
        setName,
        setDisplayCurrency,
        toggleCurrency,
        setUsdRate,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
