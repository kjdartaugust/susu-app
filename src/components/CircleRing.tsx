import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { colors, fonts } from "../theme";

// The product, drawn. Members sit around a ring and the pot moves one seat per
// round — which *is* susu, so this explains the app faster than any paragraph.
// Built from plain Views + trig so it needs no SVG/animation dependency.

const MEMBERS = ["Ama", "Kofi", "Yaa", "Kwame", "Efua", "Nii"];

export default function CircleRing({
  size = 260,
  /** Fix the highlight to one seat (used by the explainer); omit to rotate. */
  step,
  /** ms per round when rotating. */
  interval = 1900,
  showCaption = true,
}: {
  size?: number;
  step?: number;
  interval?: number;
  showCaption?: boolean;
}) {
  const n = MEMBERS.length;
  const [active, setActive] = useState(step ?? 0);

  // Rotate the pot, unless the caller pinned a step.
  useEffect(() => {
    if (step !== undefined) {
      setActive(step);
      return;
    }
    const id = setInterval(() => setActive((i) => (i + 1) % n), interval);
    return () => clearInterval(id);
  }, [step, interval, n]);

  const dot = size * 0.185;
  const radius = size / 2 - dot / 2;
  const center = size / 2;

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: size, height: size }}>
        {/* the ring the pot travels along */}
        <View
          style={{
            position: "absolute",
            left: dot / 2,
            top: dot / 2,
            width: size - dot,
            height: size - dot,
            borderRadius: (size - dot) / 2,
            borderWidth: 1,
            borderColor: colors.hairline,
          }}
        />

        <Hub size={size} name={MEMBERS[active]} />

        {MEMBERS.map((name, i) => {
          // -90° so the first seat sits at the top of the ring.
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          return (
            <Seat
              key={name}
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
    Animated.timing(a, {
      toValue: active ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
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
        backgroundColor: a.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.cardAlt, colors.gold],
        }),
        borderColor: a.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.border, colors.gold],
        }),
        shadowColor: colors.gold,
        shadowOpacity: a.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Animated.Text
        style={{
          fontWeight: "800",
          fontSize: size * 0.3,
          color: a.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.muted, "#241A05"],
          }),
        }}
      >
        {name.slice(0, 2)}
      </Animated.Text>
    </Animated.View>
  );
}

/** Centre of the ring: the pot, and who's collecting it this round. */
function Hub({ size, name }: { size: number; name: string }) {
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

  return (
    <View
      style={{
        position: "absolute",
        left: size * 0.22,
        top: size * 0.22,
        width: size * 0.56,
        height: size * 0.56,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View style={{ alignItems: "center", transform: [{ scale: a }] }}>
        <Text
          style={{
            fontFamily: fonts.displayBold,
            // Kept well inside the seats' inner edge so the pot never collides
            // with a member's avatar.
            fontSize: size * 0.113,
            color: colors.text,
            letterSpacing: -0.5,
          }}
        >
          GH₵1,200
        </Text>
        <Text
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
      </Animated.View>
    </View>
  );
}
