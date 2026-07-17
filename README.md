# Susu — group savings tracker

A native mobile app (iOS + Android) for tracking **susu** — the traditional West
African rotating savings method where everyone in a circle contributes a fixed
amount each round and one member collects the whole pot in turn.

Built with **Expo (React Native) + TypeScript**. All data is stored **offline on
the device** (AsyncStorage) — nothing is uploaded.

## Features

- **Susu circles** — create a circle, add members in payout order, set the
  contribution amount and frequency (weekly / biweekly / monthly).
- **Automatic rotation** — the app works out whose turn it is to collect each
  round and how many rounds remain.
- **Payment tracking** — tap a member to mark them paid for the current round;
  scroll back through past rounds and ahead to upcoming ones.
- **Savings goals** — set a target (school fees, rent, a phone) and log
  deposits/withdrawals toward it.
- **Home dashboard** — total saved across every circle and goal at a glance.

## Run it locally

```bash
npm install
npm start          # then scan the QR code with the Expo Go app
# or
npm run android
npm run ios        # requires macOS
```

## Ship it to the App Store

This needs an **Apple Developer account ($99/yr)** and Expo's cloud build
service (works from Windows — no Mac required):

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build --platform ios       # cloud build, produces an .ipa
eas submit --platform ios      # uploads to App Store Connect / TestFlight
```

For Android / Google Play, swap `ios` for `android`.

## Tech

- Expo SDK 57, React Native 0.86, React 19, TypeScript
- Offline persistence via `@react-native-async-storage/async-storage`
- No backend, no accounts, no tracking
