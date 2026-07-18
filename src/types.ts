export type Frequency = "weekly" | "biweekly" | "monthly";

export interface Member {
  id: string;
  name: string;
}

/** A rotating savings circle (susu). Each cycle everyone contributes the same
 *  amount and one member receives the whole pot; the turn rotates in order. */
export interface Circle {
  id: string;
  name: string;
  contribution: number; // amount per member, per cycle (GHS)
  frequency: Frequency;
  startDate: string; // ISO date the first cycle began
  members: Member[]; // order = payout order
  /** key `${cycleIndex}:${memberId}` -> true when that member has paid */
  paid: Record<string, boolean>;
}

export interface SavingsTxn {
  id: string;
  amount: number; // positive = deposit, negative = withdrawal
  note: string;
  date: string; // ISO
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  txns: SavingsTxn[];
}

export type Currency = "GHS" | "USD";

export interface AppData {
  circles: Circle[];
  goals: Goal[];
  /** All money is stored internally in GHS (base). This chooses how it's shown. */
  displayCurrency: Currency;
  /** GHS per 1 USD, used to convert for display + entry. */
  usdRate: number;
  name: string; // the user's display name
}
