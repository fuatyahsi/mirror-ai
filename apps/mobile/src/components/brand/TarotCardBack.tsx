import { StyleSheet, View } from "react-native";
import { colors, featureColors, radii } from "@/theme";
import { MirrorMark } from "@/components/brand/MirrorMark";

type TarotCardBackProps = {
  width?: number;
  height?: number;
  accentColor?: string;
  surfaceColor?: string;
  secondaryColor?: string;
};

const SPOKES = Array.from({ length: 8 });

export function TarotCardBack({
  width = 72,
  height = 114,
  accentColor = featureColors.tarot.accent,
  surfaceColor = featureColors.tarot.surface,
  secondaryColor = colors.accentGold
}: TarotCardBackProps) {
  const minSide = Math.min(width, height);
  const markSize = minSide * 0.3;
  const medallionSize = minSide * 0.72;
  const cornerSize = minSide * 0.16;

  return (
    <View
      style={[
        styles.card,
        {
          width,
          height,
          borderRadius: radii.sm,
          backgroundColor: surfaceColor,
          borderColor: accentColor
        }
      ]}
    >
      <View style={[styles.leftFoil, { backgroundColor: secondaryColor }]} />
      <View style={[styles.rightFoil, { backgroundColor: accentColor }]} />
      <View style={[styles.paperSheen, { backgroundColor: accentColor }]} />
      <View style={[styles.diagonalBand, { backgroundColor: secondaryColor }]} />
      <View style={[styles.outerFrame, { borderColor: accentColor }]} />
      <View style={[styles.innerFrame, { borderColor: secondaryColor }]} />
      <View style={styles.cornerWrap}>
        <View
          style={[
            styles.cornerGlyph,
            styles.topLeftGlyph,
            { width: cornerSize, height: cornerSize, borderColor: secondaryColor }
          ]}
        />
        <View
          style={[
            styles.cornerGlyph,
            styles.topRightGlyph,
            { width: cornerSize, height: cornerSize, borderColor: secondaryColor }
          ]}
        />
        <View
          style={[
            styles.cornerGlyph,
            styles.bottomLeftGlyph,
            { width: cornerSize, height: cornerSize, borderColor: secondaryColor }
          ]}
        />
        <View
          style={[
            styles.cornerGlyph,
            styles.bottomRightGlyph,
            { width: cornerSize, height: cornerSize, borderColor: secondaryColor }
          ]}
        />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.rail}>
          <View style={[styles.railLine, { backgroundColor: accentColor }]} />
          <View style={[styles.railGem, { backgroundColor: secondaryColor }]} />
          <View style={[styles.railLine, { backgroundColor: accentColor }]} />
        </View>
        <View style={styles.centerPanel}>
          <View style={[styles.sideLine, styles.leftLine, { backgroundColor: accentColor }]} />
          <View style={[styles.sideLine, styles.rightLine, { backgroundColor: accentColor }]} />
          <View style={[styles.verticalSigil, { backgroundColor: secondaryColor }]} />
          <View style={[styles.horizontalSigil, { backgroundColor: accentColor }]} />
          <View
            style={[
              styles.medallionGlow,
              {
                width: medallionSize * 1.25,
                height: medallionSize * 1.25,
                borderRadius: medallionSize,
                backgroundColor: accentColor
              }
            ]}
          />
          <View
            style={[
              styles.medallionOuter,
              {
                width: medallionSize,
                height: medallionSize,
                borderRadius: medallionSize / 2,
                borderColor: accentColor
              }
            ]}
          >
            {SPOKES.map((_, index) => (
              <View
                key={`spoke-${index}`}
                style={[
                  styles.spoke,
                  {
                    backgroundColor: index % 2 === 0 ? secondaryColor : accentColor,
                    transform: [{ rotate: `${index * 45}deg` }]
                  }
                ]}
              />
            ))}
            <View
              style={[
                styles.medallionInner,
                {
                  width: medallionSize * 0.66,
                  height: medallionSize * 0.66,
                  borderRadius: medallionSize * 0.33,
                  borderColor: secondaryColor
                }
              ]}
            />
            <View
              style={[
                styles.medallionCore,
                {
                  width: medallionSize * 0.38,
                  height: medallionSize * 0.38,
                  borderRadius: medallionSize * 0.19,
                  borderColor: accentColor
                }
              ]}
            />
            <MirrorMark size={markSize} />
          </View>
        </View>
        <View style={styles.rail}>
          <View style={[styles.railLine, { backgroundColor: secondaryColor }]} />
          <View style={[styles.railGem, { backgroundColor: accentColor }]} />
          <View style={[styles.railLine, { backgroundColor: secondaryColor }]} />
        </View>
      </View>
      <View style={[styles.glint, { backgroundColor: accentColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  paperSheen: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "38%",
    height: "100%",
    opacity: 0.09
  },
  leftFoil: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 3,
    opacity: 0.58
  },
  rightFoil: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 1,
    opacity: 0.5
  },
  outerFrame: {
    position: "absolute",
    top: 4,
    right: 4,
    bottom: 4,
    left: 4,
    borderRadius: 8,
    borderWidth: 1,
    opacity: 0.84
  },
  innerFrame: {
    position: "absolute",
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderRadius: 6,
    borderWidth: 1,
    opacity: 0.46
  },
  cardBody: {
    position: "absolute",
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4
  },
  diagonalBand: {
    position: "absolute",
    width: "130%",
    height: "18%",
    opacity: 0.1,
    transform: [{ rotate: "-28deg" }]
  },
  rail: {
    width: "72%",
    height: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  railLine: {
    flex: 1,
    height: 1,
    opacity: 0.68
  },
  railGem: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.9
  },
  centerPanel: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  sideLine: {
    position: "absolute",
    width: 1,
    height: "66%",
    opacity: 0.34
  },
  leftLine: {
    left: 4
  },
  rightLine: {
    right: 4
  },
  verticalSigil: {
    position: "absolute",
    width: 1,
    height: "74%",
    opacity: 0.18
  },
  horizontalSigil: {
    position: "absolute",
    width: "74%",
    height: 1,
    opacity: 0.18
  },
  medallionGlow: {
    position: "absolute",
    opacity: 0.1
  },
  medallionOuter: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden"
  },
  medallionInner: {
    position: "absolute",
    borderWidth: 1,
    opacity: 0.54
  },
  medallionCore: {
    position: "absolute",
    borderWidth: 1,
    opacity: 0.34
  },
  spoke: {
    position: "absolute",
    width: 1,
    height: "92%",
    opacity: 0.2
  },
  cornerWrap: {
    ...StyleSheet.absoluteFillObject
  },
  cornerGlyph: {
    position: "absolute",
    borderWidth: 1,
    opacity: 0.7,
    borderRadius: 2
  },
  topLeftGlyph: {
    top: 6,
    left: 7,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  topRightGlyph: {
    top: 6,
    right: 7,
    borderLeftWidth: 0,
    borderBottomWidth: 0
  },
  bottomLeftGlyph: {
    bottom: 6,
    left: 7,
    borderRightWidth: 0,
    borderTopWidth: 0
  },
  bottomRightGlyph: {
    bottom: 6,
    right: 7,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  glint: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "46%",
    height: 1,
    opacity: 0.62
  }
});
