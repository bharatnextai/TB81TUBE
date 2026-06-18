import type { ReactNode } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type AppTextProps = {
  children: ReactNode;
  variant?: "title" | "heading" | "body" | "small";
  muted?: boolean;
  style?: TextStyle;
};

export function AppText({ children, variant = "body", muted = false, style }: AppTextProps) {
  return <Text style={[styles.base, styles[variant], muted && styles.muted, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  base: {
    color: colors.text
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700"
  },
  heading: {
    fontSize: typography.heading,
    fontWeight: "700"
  },
  body: {
    fontSize: typography.body,
    lineHeight: 22
  },
  small: {
    fontSize: typography.small,
    lineHeight: 18
  },
  muted: {
    color: colors.textMuted
  }
});
