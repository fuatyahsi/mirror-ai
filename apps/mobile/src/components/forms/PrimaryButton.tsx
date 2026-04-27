import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radii, spacing } from "@/theme";

type PrimaryButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({
  children,
  onPress,
  variant = "primary",
  disabled,
  style
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "secondary" && styles.secondaryText,
          variant === "ghost" && styles.ghostText
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 14
  },
  primary: {
    backgroundColor: colors.accent
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: "transparent"
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    opacity: 0.82
  },
  text: {
    color: colors.background,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.2
  },
  secondaryText: {
    color: colors.text
  },
  ghostText: {
    color: colors.accent
  }
});
