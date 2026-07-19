import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { colors, fonts } from "../theme";

// The product, drawn. Members sit around a ring and the pot moves one seat per
// round — which *is* susu, so this explains the app faster than any paragraph.
// Built from plain Views + trig so it needs no SVG/animation dependency.
//
// Uncontrolled (welcome screen) it rotates through demo members on its own.
// Controlled (a real circle) it takes that circle's members and highlights
// whoever collects the round being viewed.

const DEMO_MEMBERS = ["Ama", "Kofi", "Yaa", "Kwame", "Efua", "Nii"];
const DEMO_AMOUNT = "GH₵1,200";

export default function CircleRing({
  size = 260,
  members = DEMO_MEMBERS,
  amount = DEMO_AMOUNT,
  /** Pin the highlight to one seat; omit to rotate on a timer. */
  step,
  /** ms per round when rotating. */
  interval = 1900,
  showCaption = true,
}: {
  size?: number;
  members?: string[];
  amount?: string;
  step?: number;
  interval?: number;
  showCaption?: boolean;
}) {
  const n = Math.max(members.length, 1);
  const [spin, setSpin] = useState(0);

  // Only run the timer when uncontrolled — a real circle is driven by the round
  // the user is looking at.
  useEffect(() => {
    if (step !== undefined) return;
    const id = setInterval(() => setSpin((i) => (i + 1) % n), interval);
    return () => clearInterval(id);
  }, [step, interval, n]);

  const active = step === undefined ? spin % n : ((step % n) + n) % n;

  // Seats must not collide once a circle has many members, so cap the dot to
  // the arc available to each one.
  const radius = size * 0.5 * 0.815;
  const arc = (2 * Math.PI * radius) / n;
  const dot = Math.max(26, Math.min(size * 0.185, arc * 0.82));
  const center = size / 2;

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: size, height: size }}>
        {/* the ring the pot travels along */}
        <View
          style={{
            position: "absolute",
            left: center - radius,
            top: center - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            borderWidth: 1,
            borderColor: colors.hairline,
          }}
        />

        <Hub size={size} name={members[active] ?? ""} amount={amount} />

        {members.map((name, i) => {
          // -90° so the first seat sits at the top of the ring.
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          return (
            <Seat
              key={`${name}-${i}`}
              name={name}
              size={dot}
              active={i === active}
              left={center + radius * Math.cos(angle) - dot / 2}
              top={center + radius * Math.sin(angle) - dot / 2}
            />
          );
        })}
      </View>

      {showCaption && (
        <Text
          style={{
            color: colors.muted,
            fontSize: 13,
            marginTop: 18,
            letterSpacing: 0.2,
          }}
        >
          Round {active + 1} of {n} · everyone gets a turn
        </Text>
      )}
    </View>
  );
}

/** One member's seat on the ring; lights up gold on the round they collect. */
function Seat({
  name,
  size,
  active,
  left,
  top,
}: {
  name: string;
  size: number;
  active: boolean;
  left: number;
  top: number;
}) {
  const a = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(a, {
      toValue: active ? 1 : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: false,
    }).start();
  }, [active, a]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        transform: [
          { scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) },
        ],
        // Colour follows the state directly rather than an interpolation. If a
        // frame is dropped or throttled, an animated colour can lag a step
        // behind and show gold on one member while the centre names another —
        // so only scale and glow animate. Motion is still there; a wrong
        // answer never is.
        backgroundColor: active ? colors.gold : colors.cardAlt,
        borderColor: active ? colors.gold : colors.border,
        shadowColor: colors.gold,
        shadowOpacity: a.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Text
        style={{
          fontWeight: "800",
          fontSize: size * 0.3,
          color: active ? "#241A05" : colors.muted,
        }}
      >
        {name.slice(0, 2)}
      </Text>
    </Animated.View>
  );
}

/** Centre of the ring: the pot, and who's collecting it this round. */
function Hub({
  size,
  name,
  amount,
}: {
  size: number;
  name: string;
  amount: string;
}) {
  const a = useRef(new Animated.Value(1)).current;

  // A small pulse on hand-off sells that the pot actually moved.
  useEffect(() => {
    a.setValue(0.82);
    Animated.spring(a, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: false,
    }).start();
  }, [name, a]);

  // Longer amounts (a big pot, or USD) must still clear the seats, so the type
  // shrinks with the string rather than overflowing the ring.
  const base = size * 0.1;
  const fit = amount.length > 9 ? (base * 9) / amount.length : base;
  const amountSize = Math.max(size * 0.062, fit);

  return (
    <View
      style={{
        position: "absolute",
        left: size * 0.2,
        top: size * 0.2,
        width: size * 0.6,
        height: size * 0.6,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View style={{ alignItems: "center", transform: [{ scale: a }] }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fonts.displayBold,
            fontSize: amountSize,
            color: colors.text,
            letterSpacing: -0.5,
          }}
        >
          {amount}
        </Text>
        {!!name && (
          <Text
            numberOfLines={1}
            style={{
              color: colors.gold,
              fontWeight: "700",
              fontSize: size * 0.048,
              marginTop: 5,
              letterSpacing: 0.3,
            }}
          >
            {name} collects
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
