import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import {
  clearHistory,
  getFavorites,
  getHistory,
  getPlaylists,
  type FavoriteRecord,
  type HistoryRecord,
  type PlaylistRecord
} from "../../services/libraryService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { MainTabParamList, RootStackParamList } from "../../types";
import type { ContentItem } from "../../types/content";

type LibraryNavigation = CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList, "Library">, NativeStackNavigationProp<RootStackParamList>>;

export function LibraryScreen() {
  const navigation = useNavigation<LibraryNavigation>();
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  const loadLibrary = useCallback(async (showInitialLoader = false) => {
    setError("");

    if (showInitialLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [favoriteItems, historyItems, playlistItems] = await Promise.all([getFavorites(), getHistory(), getPlaylists()]);
      setFavorites(favoriteItems);
      setHistory(historyItems);
      setPlaylists(playlistItems);
    } catch (loadError) {
      setError(getLibraryErrorMessage(loadError));
    } finally {
      if (showInitialLoader) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary(true);
  }, [loadLibrary]);

  async function handleClearHistory() {
    setError("");
    setClearingHistory(true);

    try {
      await clearHistory();
      setHistory([]);
    } catch (clearError) {
      setError(getLibraryErrorMessage(clearError));
    } finally {
      setClearingHistory(false);
    }
  }

  function openContent(contentItem: ContentItem) {
    navigation.navigate("Player", { contentItem });
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <AppText variant="title">Library</AppText>
            <AppText muted>Your favorites and history will appear here.</AppText>
          </View>
          <Pressable accessibilityRole="button" disabled={refreshing} onPress={() => loadLibrary(false)} style={styles.refreshButton}>
            {refreshing ? <ActivityIndicator color={colors.white} size="small" /> : <AppText style={styles.buttonText}>Refresh</AppText>}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
            <Pressable accessibilityRole="button" onPress={() => loadLibrary(false)} style={styles.errorAction}>
              <AppText style={styles.buttonText}>Retry</AppText>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.accent} />
            <AppText muted>Loading library...</AppText>
          </View>
        ) : null}

        {!loading ? (
          <>
            <SectionHeader title="Watch History" actionTitle={history.length ? (clearingHistory ? "Clearing..." : "Clear history") : undefined} onAction={handleClearHistory} />
            <ContentSection
              emptyMessage="Your watch history will appear here."
              items={history.map((record) => record.contentItem)}
              onPress={openContent}
            />

            <SectionHeader title="Favorites" />
            <ContentSection
              emptyMessage="Your favorites will appear here."
              items={favorites.map((record) => record.contentItem)}
              onPress={openContent}
            />

            <SectionHeader title="Playlists" actionTitle="Go to Playlists" onAction={() => navigation.navigate("Playlists")} />
            {playlists.length ? (
              <View style={styles.sectionList}>
                {playlists.map((playlist) => (
                  <View key={playlist.id} style={styles.playlistCard}>
                    <AppText style={styles.titleText}>{playlist.name}</AppText>
                    <AppText muted>{playlist.description ?? "No description"}</AppText>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState message="Create your first playlist." />
            )}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function SectionHeader({ title, actionTitle, onAction }: { title: string; actionTitle?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading">{title}</AppText>
      {actionTitle && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.smallAction}>
          <AppText style={styles.smallActionText}>{actionTitle}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

function ContentSection({ emptyMessage, items, onPress }: { emptyMessage: string; items: ContentItem[]; onPress: (item: ContentItem) => void }) {
  if (!items.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <View style={styles.sectionList}>
      {items.map((item) => (
        <ContentCard item={item} key={`${item.platform}-${item.externalContentId}`} onPress={() => onPress(item)} />
      ))}
    </View>
  );
}

function ContentCard({ item, onPress }: { item: ContentItem; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.thumbnail}>
        {item.thumbnailUrl ? <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnailImage} /> : <AppText muted variant="small">No thumbnail</AppText>}
      </View>
      <View style={styles.cardContent}>
        <AppText style={styles.titleText}>{item.title}</AppText>
        <AppText muted variant="small">
          {item.creatorName ?? "Unknown creator"}
        </AppText>
        <View style={styles.badgeRow}>
          <View style={styles.platformBadge}>
            <AppText style={styles.badgeText}>{item.platform}</AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyBox}>
      <AppText muted>{message}</AppText>
    </View>
  );
}

function getLibraryErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Could not load library.";
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot connect to backend") || lowerMessage.includes("network error") || lowerMessage.includes("timed out")) {
    return "Cannot connect to backend. Please check backend server.";
  }

  return message;
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
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  refreshButton: {
    minHeight: 40,
    minWidth: 88,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm
  },
  buttonText: {
    fontWeight: "700"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm
  },
  smallAction: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm
  },
  smallActionText: {
    fontSize: 13,
    fontWeight: "700"
  },
  sectionList: {
    gap: spacing.sm
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
    width: 112,
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
  badgeRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  platformBadge: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: "flex-start"
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  playlistCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  emptyBox: {
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  stateBox: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface
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
  }
});
