import { StyleSheet, View } from "react-native";
import { colors } from "@/theme";

const stars = [
  { x: "8%", y: "6%", size: 2, opacity: 0.55 },
  { x: "80%", y: "12%", size: 1, opacity: 0.35 },
  { x: "48%", y: "4%", size: 1, opacity: 0.45 },
  { x: "92%", y: "20%", size: 2, opacity: 0.25 },
  { x: "22%", y: "30%", size: 1, opacity: 0.6 },
  { x: "66%", y: "26%", size: 2, opacity: 0.2 },
  { x: "5%", y: "52%", size: 1, opacity: 0.45 },
  { x: "90%", y: "46%", size: 2, opacity: 0.3 },
  { x: "57%", y: "40%", size: 1, opacity: 0.25 },
  { x: "30%", y: "65%", size: 2, opacity: 0.15 },
  { x: "75%", y: "60%", size: 1, opacity: 0.5 },
  { x: "15%", y: "76%", size: 2, opacity: 0.35 },
  { x: "94%", y: "73%", size: 1, opacity: 0.25 },
  { x: "52%", y: "83%", size: 2, opacity: 0.4 },
  { x: "36%", y: "91%", size: 1, opacity: 0.35 },
  { x: "82%", y: "87%", size: 2, opacity: 0.18 },
  { x: "12%", y: "94%", size: 1, opacity: 0.5 },
  { x: "60%", y: "96%", size: 2, opacity: 0.3 }
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
              opacity: star.opacity
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
    borderRadius: 999,
    backgroundColor: colors.accent
  }
});
