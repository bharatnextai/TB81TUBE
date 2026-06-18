import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { PlatformBadge } from "./PlatformBadge";
import type { UnifiedContentItem } from "../types";

type Props = {
  item: UnifiedContentItem;
  onPress: (item: UnifiedContentItem) => void;
};

function formatDuration(duration: UnifiedContentItem["duration"]) {
  if (!duration) return null;

  if (typeof duration === "number") {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ContentCard({ item, onPress }: Props) {
  const duration = formatDuration(item.duration);

  return (
    <Pressable style={styles.card} onPress={() => onPress(item)}>
      <View style={styles.thumbWrap}>
        <Image source={{ uri: item.thumbnailUrl ?? undefined }} style={styles.thumbnail} />
        {duration ? (
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.creator} numberOfLines={1}>
          {item.creatorName ?? "Unknown creator"}
        </Text>
        <View style={styles.metaRow}>
          <PlatformBadge platform={item.platform} />
          <Text style={styles.type}>{item.contentType.toLowerCase()}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomColor: "#eceff3",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12
  },
  thumbWrap: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    height: 82,
    overflow: "hidden",
    position: "relative",
    width: 146
  },
  thumbnail: {
    height: "100%",
    width: "100%"
  },
  durationPill: {
    backgroundColor: "rgba(17, 24, 39, 0.88)",
    borderRadius: 4,
    bottom: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    position: "absolute",
    right: 5
  },
  durationText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800"
  },
  body: {
    flex: 1,
    justifyContent: "center"
  },
  title: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  creator: {
    color: "#667085",
    fontSize: 13,
    marginTop: 5
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  type: {
    color: "#667085",
    fontSize: 12,
    textTransform: "capitalize"
  }
});
