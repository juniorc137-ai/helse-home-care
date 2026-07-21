import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION_MS } from "../constants/theme";

const PARTICLES = ["🎉", "✨", "🎊", "✨", "🎉", "✨"] as const;

interface ParticleProps {
  emoji: string;
  angle: number; // graus
}

function Particle({ emoji, angle }: ParticleProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: ANIMATION_MS.celebration, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const radians = (angle * Math.PI) / 180;
  const distance = 60;

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: Math.cos(radians) * distance * progress.value },
      { translateY: Math.sin(radians) * distance * progress.value - 20 * progress.value },
      { scale: 1 - progress.value * 0.4 },
    ],
  }));

  return <Animated.Text style={[styles.particle, style]}>{emoji}</Animated.Text>;
}

/**
 * Flourish decorativo não-bloqueante (seção 4.1: feedback imediato ≤300ms
 * já ocorreu na mudança de estado; isto é só um adorno posterior, nunca
 * obstrui dados do paciente — pointerEvents "none", duração curta e fixa).
 */
export function ConfettiBurst({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.container} pointerEvents="none">
      {PARTICLES.map((emoji, index) => (
        <Particle key={index} emoji={emoji} angle={(360 / PARTICLES.length) * index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  particle: {
    position: "absolute",
    fontSize: 20,
  },
});
