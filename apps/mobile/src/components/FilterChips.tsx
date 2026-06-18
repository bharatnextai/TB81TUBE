import { ScrollView, StyleSheet } from "react-native";
import { Chip } from "react-native-paper";

export type SearchFilterKey = "all" | "video" | "audio" | "youtube" | "music" | "recent" | "long" | "short";

type Props = {
  selected: SearchFilterKey;
  onChange: (filter: SearchFilterKey) => void;
};

const filters: Array<{ key: SearchFilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "video", label: "Video" },
  { key: "audio", label: "Audio" },
  { key: "youtube", label: "YouTube" },
  { key: "music", label: "Music" },
  { key: "recent", label: "Recent" },
  { key: "long", label: "Long" },
  { key: "short", label: "Short" }
];

export function FilterChips({ selected, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {filters.map((filter) => (
        <Chip key={filter.key} selected={selected === filter.key} onPress={() => onChange(filter.key)} compact>
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 10
  }
});
