import { StyleSheet, View } from "react-native";
import { colors } from "@/theme";

type MirrorMarkProps = {
  size?: number;
};

export function MirrorMark({ size = 56 }: MirrorMarkProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.ring, styles.outer, { borderRadius: size / 2 }]} />
      <View
        style={[
          styles.ring,
          {
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: size * 0.35,
            opacity: 0.5
          }
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: size * 0.43,
            height: size * 0.43,
            borderRadius: size * 0.215,
            opacity: 0.8
          }
        ]}
      />
      <View
        style={[
          styles.core,
          {
            width: size * 0.16,
            height: size * 0.16,
            borderRadius: size * 0.08
          }
        ]}
      />
      <View
        style={[
          styles.moon,
          {
            width: size * 0.22,
            height: size * 0.34,
            borderTopLeftRadius: size * 0.2,
            borderBottomLeftRadius: size * 0.2,
            left: size * 0.27,
            top: size * 0.16
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  ring: {
    position: "absolute",
    borderWidth: 1,
    borderColor: colors.accent
  },
  outer: {
    width: "100%",
    height: "100%",
    opacity: 0.3
  },
  core: {
    position: "absolute",
    backgroundColor: colors.accent,
    opacity: 0.9
  },
  moon: {
    position: "absolute",
    backgroundColor: colors.accent,
    opacity: 0.38,
    transform: [{ rotate: "8deg" }]
  }
});
