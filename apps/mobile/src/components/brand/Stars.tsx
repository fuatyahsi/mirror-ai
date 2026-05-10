import { StyleSheet, View } from "react-native";
import { colors } from "@/theme";

const stars = [
  { x: "5%", y: "4%", size: 1.2, opacity: 0.6, color: colors.accent },
  { x: "18%", y: "11%", size: 0.8, opacity: 0.42, color: colors.accentBlue },
  { x: "32%", y: "3%", size: 1.5, opacity: 0.5, color: colors.accentStrong },
  { x: "58%", y: "8%", size: 0.9, opacity: 0.36, color: colors.accentGold },
  { x: "74%", y: "5%", size: 1.2, opacity: 0.55, color: colors.accent },
  { x: "88%", y: "14%", size: 0.7, opacity: 0.45, color: colors.accentBlue },
  { x: "95%", y: "28%", size: 1.5, opacity: 0.3, color: colors.accentStrong },
  { x: "3%", y: "36%", size: 0.9, opacity: 0.5, color: colors.accentGold },
  { x: "22%", y: "45%", size: 1.2, opacity: 0.25, color: colors.accent },
  { x: "43%", y: "22%", size: 1, opacity: 0.4, color: colors.accentBlue },
  { x: "67%", y: "32%", size: 1.8, opacity: 0.2, color: colors.accentStrong },
  { x: "80%", y: "48%", size: 0.8, opacity: 0.45, color: colors.accentGold },
  { x: "91%", y: "55%", size: 1.2, opacity: 0.35, color: colors.accent },
  { x: "12%", y: "62%", size: 0.9, opacity: 0.5, color: colors.accentBlue },
  { x: "35%", y: "70%", size: 1.5, opacity: 0.3, color: colors.accentGold },
  { x: "55%", y: "58%", size: 0.7, opacity: 0.4, color: colors.accent },
  { x: "70%", y: "66%", size: 1.2, opacity: 0.25, color: colors.accentStrong },
  { x: "85%", y: "74%", size: 0.9, opacity: 0.45, color: colors.accentBlue },
  { x: "8%", y: "80%", size: 1.5, opacity: 0.35, color: colors.accentGold },
  { x: "28%", y: "86%", size: 0.8, opacity: 0.55, color: colors.accent },
  { x: "48%", y: "78%", size: 1, opacity: 0.3, color: colors.accentBlue },
  { x: "64%", y: "88%", size: 1.5, opacity: 0.4, color: colors.accentStrong },
  { x: "78%", y: "82%", size: 0.8, opacity: 0.5, color: colors.accentGold },
  { x: "93%", y: "90%", size: 1.2, opacity: 0.3, color: colors.accent },
  { x: "15%", y: "94%", size: 0.9, opacity: 0.45, color: colors.accentBlue },
  { x: "38%", y: "97%", size: 1.5, opacity: 0.25, color: colors.accentStrong },
  { x: "62%", y: "93%", size: 0.7, opacity: 0.55, color: colors.accentGold }
] as const;

export function Stars() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((star, index) => (
        <View
          key={index}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              backgroundColor: star.color
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: "absolute",
    borderRadius: 999
  }
});
