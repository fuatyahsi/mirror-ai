import { StyleSheet, View } from "react-native";
import { colors, radii } from "@/theme";
import { MirrorMark } from "@/components/brand/MirrorMark";

type TarotCardBackProps = {
  width?: number;
  height?: number;
};

export function TarotCardBack({ width = 72, height = 114 }: TarotCardBackProps) {
  return (
    <View style={[styles.card, { width, height, borderRadius: radii.sm }]}>
      <View style={styles.inner}>
        <MirrorMark size={Math.min(width, height) * 0.52} />
      </View>
      <View style={[styles.corner, styles.topCorner]} />
      <View style={[styles.corner, styles.bottomCorner]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0D1119",
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.52)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  inner: {
    position: "absolute",
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(216,181,109,0.22)",
    alignItems: "center",
    justifyContent: "center"
  },
  corner: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: colors.accent,
    opacity: 0.22
  },
  topCorner: {
    top: 14,
    left: 22
  },
  bottomCorner: {
    bottom: 14,
    right: 22
  }
});
