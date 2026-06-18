import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { ContentCard } from "../components/ContentCard";
import { EmptyState } from "../components/EmptyState";
import { FilterChips, type SearchFilterKey } from "../components/FilterChips";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";
import { SearchBar } from "../components/SearchBar";
import { getErrorMessage } from "../services/api";
import { searchContent } from "../services/search.service";
import type { RootStackParamList, UnifiedContentItem } from "../types";

type SearchParams = {
  platform?: string;
  contentType?: string;
  duration?: string;
  sort?: string;
};

function paramsForFilter(filter: SearchFilterKey): SearchParams {
  switch (filter) {
    case "video":
      return { platform: "YOUTUBE", contentType: "VIDEO" };
    case "audio":
      return { platform: "YOUTUBE", contentType: "VIDEO" };
    case "youtube":
      return { platform: "YOUTUBE", contentType: "VIDEO" };
    case "music":
      return { platform: "YOUTUBE", contentType: "VIDEO" };
    case "recent":
      return { platform: "YOUTUBE", contentType: "VIDEO", sort: "date" };
    case "long":
      return { platform: "YOUTUBE", contentType: "VIDEO", duration: "long" };
    case "short":
      return { platform: "YOUTUBE", contentType: "VIDEO", duration: "short" };
    case "all":
    default:
      return { platform: "YOUTUBE", contentType: "VIDEO" };
  }
}

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<SearchFilterKey>("all");
  const [items, setItems] = useState<UnifiedContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(nextFilter = selectedFilter) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearched(false);
      setItems([]);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      setSearched(true);
      setItems(await searchContent({ q: trimmedQuery, ...paramsForFilter(nextFilter) }));
    } catch (searchError) {
      const message = getErrorMessage(searchError);
      setError(message);
      setItems([]);
      Alert.alert("Search failed", message);
    } finally {
      setLoading(false);
    }
  }

  function changeFilter(filter: SearchFilterKey) {
    setSelectedFilter(filter);
    if (query.trim()) {
      void submit(filter);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Search
        </Text>
        <SearchBar value={query} loading={loading} onChangeText={setQuery} onSubmit={() => void submit()} />
        <FilterChips selected={selectedFilter} onChange={changeFilter} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <LoadingState message="Searching YouTube" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.platform}-${item.externalContentId}`}
          renderItem={({ item }) => <ContentCard item={item} onPress={(video) => navigation.navigate("Player", { video })} />}
          contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={
            searched ? (
              <EmptyState title="No results found" message="Try a different search or filter." />
            ) : (
              <EmptyState title="Search YouTube" message="Find videos from official YouTube data and play them with the official player." />
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#eceff3",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  title: {
    color: "#111827",
    fontWeight: "800",
    marginBottom: 12
  },
  error: {
    color: "#be123c",
    paddingHorizontal: 16,
    paddingTop: 10
  },
  emptyList: {
    flexGrow: 1
  }
});
