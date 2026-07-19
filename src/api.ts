import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import { Circle, Frequency, Goal } from "./types";

// Client for the shared Dola backend. Auth is a Bearer token (there's no cookie
// jar on native): we get it from /api/auth/{login,signup} and send it on every
// call. The token is cached in memory and persisted so a returning user stays
// signed in.

const TOKEN_KEY = "susu.token.v1";

let token: string | null = null;

export async function loadToken(): Promise<string | null> {
  if (token) return token;
  token = await AsyncStorage.getItem(TOKEN_KEY);
  return token;
}

export async function setToken(t: string | null): Promise<void> {
  token = t;
  if (t) await AsyncStorage.setItem(TOKEN_KEY, t);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!token;
}

/** The slice of app data that lives on the server. Local display prefs (name,
 *  currency, rate) are kept on-device and merged in by the store. */
export interface SusuState {
  circles: Circle[];
  goals: Goal[];
  /** The account's own name, used to greet the user on any device. */
  userName: string;
}

async function api<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection.");
  }
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok) {
    const msg = (data as { error?: string }).error;
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data as T;
}

/* ---------------------------------------------------------------- auth ---- */

interface AuthResponse {
  token?: string;
  state?: unknown;
  error?: string;
}

export async function signup(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}): Promise<void> {
  const res = await api<AuthResponse>("POST", "/api/auth/signup", input);
  if (!res.token) throw new Error(res.error || "Signup failed.");
  await setToken(res.token);
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<void> {
  const res = await api<AuthResponse>("POST", "/api/auth/login", input);
  if (!res.token) throw new Error(res.error || "Login failed.");
  await setToken(res.token);
}

export async function logout(): Promise<void> {
  await setToken(null);
}

/* ---------------------------------------------------------------- susu ---- */

// Every susu mutation returns the fresh server state, so the store just swaps
// its data in rather than reconciling by hand.

export async function fetchState(): Promise<SusuState> {
  const { state } = await api<{ state: SusuState | null }>(
    "GET",
    "/api/susu/state"
  );
  return state ?? { circles: [], goals: [], userName: "" };
}

export async function createCircle(input: {
  name: string;
  contribution: number;
  frequency: Frequency;
  startDate: string;
  members: string[];
}): Promise<SusuState> {
  const { state } = await api<{ state: SusuState }>(
    "POST",
    "/api/susu/circles",
    input
  );
  return state;
}

export async function deleteCircle(id: string): Promise<SusuState> {
  const { state } = await api<{ state: SusuState }>(
    "DELETE",
    `/api/susu/circles/${id}`
  );
  return state;
}

export async function setPaid(
  circleId: string,
  memberId: string,
  cycleIndex: number,
  paid: boolean
): Promise<SusuState> {
  const { state } = await api<{ state: SusuState }>(
    "POST",
    `/api/susu/circles/${circleId}/paid`,
    { memberId, cycleIndex, paid }
  );
  return state;
}

export async function createGoal(input: {
  name: string;
  target: number;
}): Promise<SusuState> {
  const { state } = await api<{ state: SusuState }>(
    "POST",
    "/api/susu/goals",
    input
  );
  return state;
}

export async function deleteGoal(id: string): Promise<SusuState> {
  const { state } = await api<{ state: SusuState }>(
    "DELETE",
    `/api/susu/goals/${id}`
  );
  return state;
}

export async function addGoalTxn(
  goalId: string,
  amount: number,
  note: string
): Promise<SusuState> {
  const { state } = await api<{ state: SusuState }>(
    "POST",
    `/api/susu/goals/${goalId}/txns`,
    { amount, note }
  );
  return state;
}

/* ------------------------------------------------------------- invites ---- */

export interface InvitePreview {
  circleName: string;
  memberName: string;
  contribution: number;
  claimed: boolean;
}

// Owner mints an invite for a member slot; returns the token to share.
export async function createInvite(
  circleId: string,
  memberId: string
): Promise<string> {
  const { token } = await api<{ token: string }>(
    "POST",
    `/api/susu/circles/${circleId}/invite`,
    { memberId }
  );
  return token;
}

// Public — no auth needed to look at what an invite is for.
export async function fetchInvitePreview(
  token: string
): Promise<InvitePreview> {
  const { invite } = await api<{ invite: InvitePreview }>(
    "GET",
    `/api/susu/invites/${encodeURIComponent(token)}`
  );
  return invite;
}

export async function acceptInvite(token: string): Promise<SusuState> {
  const { state } = await api<{ state: SusuState }>(
    "POST",
    `/api/susu/invites/${encodeURIComponent(token)}/accept`
  );
  return state;
}
