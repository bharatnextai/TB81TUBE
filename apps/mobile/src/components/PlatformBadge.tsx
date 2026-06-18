import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import type { Platform } from "../types";

type Props = {
  platform: Platform;
};

const labels: Record<Platform, string> = {
  YOUTUBE: "YouTube",
  JIOSAAVN: "JioSaavn",
  AMAZON_MUSIC: "Amazon Music",
  AIRTEL_WYNK: "Wynk",
  SPOTIFY: "Spotify"
};

export function PlatformBadge({ platform }: Props) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{labels[platform]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  text: {
    color: "#475467",
    fontSize: 11,
    fontWeight: "700"
  }
});
