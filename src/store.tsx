import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppData, Circle, Currency, Goal, Member, SavingsTxn } from "./types";
import { paidKey, uid } from "./logic";

const KEY = "susu.data.v1";

export const DEFAULT_USD_RATE = 15.5; // GHS per 1 USD

const EMPTY: AppData = {
  circles: [],
  goals: [],
  displayCurrency: "GHS",
  usdRate: DEFAULT_USD_RATE,
  name: "Me",
};

/** Fill in any fields missing from older saved payloads. */
function migrate(raw: Partial<AppData>): AppData {
  return {
    ...EMPTY,
    ...raw,
    displayCurrency: raw.displayCurrency ?? "GHS",
    usdRate: raw.usdRate && raw.usdRate > 0 ? raw.usdRate : DEFAULT_USD_RATE,
  };
}

/** First-run seed so the app never looks empty in reviews/screenshots. */
function seed(): AppData {
  const today = new Date();
  const start = new Date(today.getTime() - 16 * 24 * 60 * 60 * 1000); // ~2 cycles ago
  const members: Member[] = [
    { id: uid(), name: "Me" },
    { id: uid(), name: "Ama" },
    { id: uid(), name: "Kwame" },
    { id: uid(), name: "Efua" },
    { id: uid(), name: "Yaw" },
  ];
  const paid: Record<string, boolean> = {};
  // Cycle 0 fully paid, cycle 1 partly paid.
  members.forEach((m) => (paid[paidKey(0, m.id)] = true));
  paid[paidKey(1, members[0].id)] = true;
  paid[paidKey(1, members[1].id)] = true;

  const circle: Circle = {
    id: uid(),
    name: "Market Ladies Susu",
    contribution: 100,
    frequency: "weekly",
    startDate: start.toISOString(),
    members,
    paid,
  };

  const goal: Goal = {
    id: uid(),
    name: "School Fees",
    target: 2000,
    txns: [
      {
        id: uid(),
        amount: 500,
        note: "Starting balance",
        date: start.toISOString(),
      },
      { id: uid(), amount: 250, note: "Susu payout", date: today.toISOString() },
    ],
  };

  return { ...EMPTY, circles: [circle], goals: [goal] };
}

interface StoreValue {
  data: AppData;
  ready: boolean;
  // circles
  addCircle: (c: Omit<Circle, "id" | "paid">) => string;
  updateCircle: (id: string, patch: Partial<Circle>) => void;
  deleteCircle: (id: string) => void;
  togglePaid: (circleId: string, cycleIndex: number, memberId: string) => void;
  // goals
  addGoal: (name: string, target: number) => void;
  addGoalTxn: (goalId: string, amount: number, note: string) => void;
  deleteGoal: (id: string) => void;
  // settings
  setName: (name: string) => void;
  setDisplayCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  setUsdRate: (rate: number) => void;
  reset: () => void;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          setData(migrate(JSON.parse(raw)));
        } else {
          setData(seed());
        }
      } catch {
        setData(seed());
      } finally {
        loaded.current = true;
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const addCircle = useCallback((c: Omit<Circle, "id" | "paid">) => {
    const id = uid();
    setData((d) => ({
      ...d,
      circles: [...d.circles, { ...c, id, paid: {} }],
    }));
    return id;
  }, []);

  const updateCircle = useCallback((id: string, patch: Partial<Circle>) => {
    setData((d) => ({
      ...d,
      circles: d.circles.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCircle = useCallback((id: string) => {
    setData((d) => ({ ...d, circles: d.circles.filter((c) => c.id !== id) }));
  }, []);

  const togglePaid = useCallback(
    (circleId: string, cycleIndex: number, memberId: string) => {
      setData((d) => ({
        ...d,
        circles: d.circles.map((c) => {
          if (c.id !== circleId) return c;
          const k = paidKey(cycleIndex, memberId);
          const paid = { ...c.paid };
          if (paid[k]) delete paid[k];
          else paid[k] = true;
          return { ...c, paid };
        }),
      }));
    },
    []
  );

  const addGoal = useCallback((name: string, target: number) => {
    setData((d) => ({
      ...d,
      goals: [...d.goals, { id: uid(), name, target, txns: [] }],
    }));
  }, []);

  const addGoalTxn = useCallback(
    (goalId: string, amount: number, note: string) => {
      const txn: SavingsTxn = {
        id: uid(),
        amount,
        note,
        date: new Date().toISOString(),
      };
      setData((d) => ({
        ...d,
        goals: d.goals.map((g) =>
          g.id === goalId ? { ...g, txns: [txn, ...g.txns] } : g
        ),
      }));
    },
    []
  );

  const deleteGoal = useCallback((id: string) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  }, []);

  const setName = useCallback((name: string) => {
    setData((d) => ({ ...d, name }));
  }, []);

  const setDisplayCurrency = useCallback((c: Currency) => {
    setData((d) => ({ ...d, displayCurrency: c }));
  }, []);

  const toggleCurrency = useCallback(() => {
    setData((d) => ({
      ...d,
      displayCurrency: d.displayCurrency === "GHS" ? "USD" : "GHS",
    }));
  }, []);

  const setUsdRate = useCallback((rate: number) => {
    setData((d) => ({ ...d, usdRate: rate > 0 ? rate : d.usdRate }));
  }, []);

  const reset = useCallback(() => setData(seed()), []);

  return (
    <StoreCtx.Provider
      value={{
        data,
        ready,
        addCircle,
        updateCircle,
        deleteCircle,
        togglePaid,
        addGoal,
        addGoalTxn,
        deleteGoal,
        setName,
        setDisplayCurrency,
        toggleCurrency,
        setUsdRate,
        reset,
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
