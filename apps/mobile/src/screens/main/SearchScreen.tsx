import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { searchContent } from "../../services/searchService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { RootStackParamList } from "../../types";
import type { ContentItem } from "../../types/content";

type FilterKey = "all" | "youtube" | "video" | "audio";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "youtube", label: "YouTube" },
  { key: "video", label: "Video" },
  { key: "audio", label: "Audio" }
];

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(searchQuery = query) {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setError("Enter a search term.");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const result = await searchContent({
        q: trimmedQuery,
        platform: activeFilter === "youtube" ? "YOUTUBE" : undefined,
        contentType: activeFilter === "video" ? "VIDEO" : activeFilter === "audio" ? "AUDIO" : undefined,
        maxResults: 10
      });

      setItems(result.items);
    } catch (searchError) {
      setItems([]);
      setError(getSearchErrorMessage(searchError));
    } finally {
      setLoading(false);
    }
  }

  function handleTryMusic() {
    setQuery("music");
    handleSearch("music");
  }

  function handleCardPress(item: ContentItem) {
    navigation.navigate("Player", { contentItem: item });
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title">Search</AppText>
          <AppText muted>Find videos and media from your connected accounts.</AppText>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            placeholder="Search videos"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.input}
            value={query}
          />
          <Pressable accessibilityRole="button" disabled={loading} onPress={() => handleSearch()} style={[styles.searchButton, loading && styles.disabled]}>
            {loading ? <ActivityIndicator color={colors.white} size="small" /> : <AppText style={styles.searchButtonText}>Search</AppText>}
          </Pressable>
        </View>

        <ScrollView horizontal contentContainerStyle={styles.chips} showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <Pressable
              accessibilityRole="button"
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.chip, activeFilter === filter.key && styles.activeChip]}
            >
              <AppText style={activeFilter === filter.key ? styles.activeChipText : styles.chipText}>{filter.label}</AppText>
            </Pressable>
          ))}
          <Pressable accessibilityRole="button" onPress={handleTryMusic} style={styles.quickChip}>
            <AppText style={styles.chipText}>Try music</AppText>
          </Pressable>
        </ScrollView>

        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
            <Pressable accessibilityRole="button" onPress={() => handleSearch()} style={styles.errorAction}>
              <AppText style={styles.searchButtonText}>Retry</AppText>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.accent} />
            <AppText muted>Searching...</AppText>
          </View>
        ) : null}

        {!loading && !searched ? <EmptyState message="Search videos and media from your connected accounts." /> : null}
        {!loading && searched && !error && items.length === 0 ? <EmptyState message="No results found." /> : null}

        {!loading && items.length > 0 ? (
          <View style={styles.results}>
            {items.map((item) => (
              <ContentResultCard item={item} key={`${item.platform}-${item.externalContentId}`} onPress={() => handleCardPress(item)} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function ContentResultCard({ item, onPress }: { item: ContentItem; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.thumbnail}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnailImage} />
        ) : (
          <AppText variant="small" muted>No thumbnail</AppText>
        )}
      </View>
      <View style={styles.cardContent}>
        <AppText style={styles.titleText}>{item.title}</AppText>
        <AppText muted variant="small">
          {item.creatorName ?? "Unknown creator"}
        </AppText>
        <View style={styles.metaRow}>
          <View style={styles.platformBadge}>
            <AppText style={styles.badgeText}>{item.platform}</AppText>
          </View>
          <View style={styles.typeBadge}>
            <AppText style={styles.badgeText}>{item.contentType}</AppText>
          </View>
          {item.duration ? <AppText muted variant="small">{formatDuration(item.duration)}</AppText> : null}
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.stateBox}>
      <AppText muted>{message}</AppText>
    </View>
  );
}

function getSearchErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Search failed.";
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("youtube account is not connected")) {
    return "Connect YouTube first from Connected Accounts.";
  }

  return message;
}

function formatDuration(duration: string | number) {
  return typeof duration === "number" ? `${duration}s` : duration;
}

const styles = StyleSheet.create({
  screen: {
    padding: 0
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md
  },
  header: {
    gap: spacing.xs
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 16
  },
  searchButton: {
    minHeight: 48,
    minWidth: 92,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md
  },
  searchButtonText: {
    fontWeight: "700"
  },
  disabled: {
    opacity: 0.6
  },
  chips: {
    gap: spacing.sm
  },
  chip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  activeChip: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  quickChip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700"
  },
  activeChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white
  },
  errorBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: "#2a0d14",
    padding: spacing.md,
    gap: spacing.sm
  },
  errorAction: {
    minHeight: 38,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md
  },
  errorText: {
    color: colors.white
  },
  stateBox: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  results: {
    gap: spacing.md
  },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.sm
  },
  thumbnail: {
    width: 120,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: colors.black,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  thumbnailImage: {
    width: "100%",
    height: "100%"
  },
  cardContent: {
    flex: 1,
    gap: 6
  },
  titleText: {
    fontWeight: "700"
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  platformBadge: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  typeBadge: {
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700"
  }
});
