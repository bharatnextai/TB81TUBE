import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { getConnections } from "../../services/connectionsService";
import { getFavorites, getHistory, getPlaylists, type FavoriteRecord, type HistoryRecord, type PlaylistRecord } from "../../services/libraryService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { MainTabParamList, RootStackParamList } from "../../types";
import type { ConnectedAccount } from "../../types/connections";
import type { ContentItem } from "../../types/content";

type HomeNavigation = CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList, "Home">, NativeStackNavigationProp<RootStackParamList>>;

const quickSearches = ["Music", "Hindi songs", "Learning", "Trending"];

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const youtubeConnected = connections.some((connection) => connection.platform === "YOUTUBE");

  const loadHome = useCallback(async (showInitialLoader = false) => {
    setError("");

    if (showInitialLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [connectionItems, historyItems, favoriteItems, playlistItems] = await Promise.all([
        getConnections(),
        getHistory(),
        getFavorites(),
        getPlaylists()
      ]);

      setConnections(connectionItems);
      setHistory(historyItems);
      setFavorites(favoriteItems);
      setPlaylists(playlistItems);
    } catch (loadError) {
      setError(getHomeErrorMessage(loadError));
    } finally {
      if (showInitialLoader) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHome(true);
  }, [loadHome]);

  function openContent(contentItem: ContentItem) {
    navigation.navigate("Player", { contentItem });
  }

  function openSearch() {
    navigation.navigate("Search");
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <AppText variant="title">TB81TUBE</AppText>
            <AppText muted>Watch, save, and organize your media.</AppText>
          </View>
          <Pressable accessibilityRole="button" onPress={openSearch} style={styles.searchButton}>
            <AppText style={styles.buttonText}>Search</AppText>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={() => navigation.navigate("ConnectedAccounts")} style={styles.accountCard}>
          <View>
            <AppText variant="heading">YouTube</AppText>
            <AppText muted>{youtubeConnected ? "YouTube connected" : "Connect YouTube"}</AppText>
          </View>
          <View style={[styles.statusPill, youtubeConnected ? styles.connectedPill : styles.inactivePill]}>
            <AppText style={styles.statusText}>{youtubeConnected ? "Connected" : "Connect"}</AppText>
          </View>
        </Pressable>

        <View style={styles.topActions}>
          <Pressable accessibilityRole="button" disabled={refreshing} onPress={() => loadHome(false)} style={styles.refreshButton}>
            {refreshing ? <ActivityIndicator color={colors.white} size="small" /> : <AppText style={styles.buttonText}>Refresh</AppText>}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
            <Pressable accessibilityRole="button" onPress={() => loadHome(false)} style={styles.errorAction}>
              <AppText style={styles.buttonText}>Retry</AppText>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.accent} />
            <AppText muted>Loading home...</AppText>
          </View>
        ) : null}

        {!loading ? (
          <>
            {!history.length && !favorites.length && !playlists.length ? (
              <View style={styles.emptyBox}>
                <AppText muted>Start by connecting YouTube or searching videos.</AppText>
              </View>
            ) : null}

            <SectionHeader title="Continue Watching" />
            <MediaRow emptyMessage="Your recently watched videos will appear here." items={history.map((item) => item.contentItem).slice(0, 8)} onPress={openContent} />

            <SectionHeader title="Favorites" />
            <MediaRow emptyMessage="Save videos to see favorites here." items={favorites.map((item) => item.contentItem).slice(0, 8)} onPress={openContent} />

            <SectionHeader title="Your Playlists" />
            {playlists.length ? (
              <ScrollView horizontal contentContainerStyle={styles.horizontalList} showsHorizontalScrollIndicator={false}>
                {playlists.slice(0, 8).map((playlist) => (
                  <Pressable
                    accessibilityRole="button"
                    key={playlist.id}
                    onPress={() => navigation.navigate("PlaylistDetail", { playlistId: playlist.id })}
                    style={styles.playlistCard}
                  >
                    <AppText style={styles.titleText}>{playlist.name}</AppText>
                    <AppText muted variant="small">
                      {playlist.description ?? "No description"}
                    </AppText>
                    <AppText muted variant="small">
                      {playlist.items?.length ?? 0} items
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <EmptySection message="Create your first playlist." />
            )}

            <SectionHeader title="Quick Search" />
            <View style={styles.quickSearchRow}>
              {quickSearches.map((label) => (
                <Pressable accessibilityRole="button" key={label} onPress={openSearch} style={styles.quickChip}>
                  <AppText style={styles.buttonText}>{label}</AppText>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <AppText variant="heading">{title}</AppText>;
}

function MediaRow({ emptyMessage, items, onPress }: { emptyMessage: string; items: ContentItem[]; onPress: (item: ContentItem) => void }) {
  if (!items.length) {
    return <EmptySection message={emptyMessage} />;
  }

  return (
    <ScrollView horizontal contentContainerStyle={styles.horizontalList} showsHorizontalScrollIndicator={false}>
      {items.map((item) => (
        <MediaCard item={item} key={`${item.platform}-${item.externalContentId}`} onPress={() => onPress(item)} />
      ))}
    </ScrollView>
  );
}

function MediaCard({ item, onPress }: { item: ContentItem; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.mediaCard}>
      <View style={styles.thumbnail}>
        {item.thumbnailUrl ? <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnailImage} /> : <AppText muted variant="small">No thumbnail</AppText>}
      </View>
      <AppText style={styles.mediaTitle}>{item.title}</AppText>
      <AppText muted variant="small">
        {item.creatorName ?? "Unknown creator"}
      </AppText>
      <View style={styles.platformBadge}>
        <AppText style={styles.badgeText}>{item.platform}</AppText>
      </View>
    </Pressable>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <View style={styles.emptyBox}>
      <AppText muted>{message}</AppText>
    </View>
  );
}

function getHomeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Could not load home.";
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  searchButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md
  },
  buttonText: {
    fontWeight: "700"
  },
  accountCard: {
    minHeight: 96,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  connectedPill: {
    backgroundColor: colors.accent
  },
  inactivePill: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700"
  },
  topActions: {
    alignItems: "flex-start"
  },
  refreshButton: {
    minHeight: 38,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md
  },
  horizontalList: {
    gap: spacing.md,
    paddingRight: spacing.md
  },
  mediaCard: {
    width: 190,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.sm
  },
  thumbnail: {
    width: "100%",
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
  mediaTitle: {
    fontWeight: "700"
  },
  platformBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  playlistCard: {
    width: 190,
    minHeight: 116,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  titleText: {
    fontWeight: "700"
  },
  quickSearchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quickChip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  emptyBox: {
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
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
