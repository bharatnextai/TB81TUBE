import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { UnifiedContentItem } from "../types";

type Props = {
  item: UnifiedContentItem;
  onPress: (item: UnifiedContentItem) => void;
  rightAction?: React.ReactNode;
};

export function VideoCard({ item, onPress, rightAction }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(item)}>
      <Image source={{ uri: item.thumbnailUrl ?? undefined }} style={styles.thumbnail} />
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.creatorName ?? "Unknown channel"}
        </Text>
      </View>
      {rightAction}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderBottomColor: "#eceff3",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12
  },
  thumbnail: {
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    height: 76,
    width: 136
  },
  copy: {
    flex: 1
  },
  title: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20
  },
  meta: {
    color: "#667085",
    fontSize: 13,
    marginTop: 5
  }
});
