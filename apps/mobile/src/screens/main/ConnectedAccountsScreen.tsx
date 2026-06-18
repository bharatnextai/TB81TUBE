import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { API_BASE_URL } from "../../config/api";
import { apiClient, checkApiStatus } from "../../services/apiClient";
import { disconnectAccount, getConnections, startYouTubeConnection } from "../../services/connectionsService";
import { useAuth } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { RootStackParamList } from "../../types";
import type { ConnectedAccount } from "../../types/connections";

export function ConnectedAccountsScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("");
  const [configStatus, setConfigStatus] = useState("");
  const [connectHint, setConnectHint] = useState("");
  const [developerDetailsVisible, setDeveloperDetailsVisible] = useState(false);
  const [fullBackendError, setFullBackendError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const youtubeConnection = useMemo(
    () => connections.find((connection) => connection.platform === "YOUTUBE"),
    [connections]
  );
  const isMockYouTubeConnection = youtubeConnection?.platformUserId === "mock-youtube-user" || youtubeConnection?.scope === "mock-youtube-readonly";

  const fetchConnections = useCallback(async (options?: { showInitialLoader?: boolean }) => {
    setError("");
    const showInitialLoader = options?.showInitialLoader ?? false;

    if (showInitialLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const items = await getConnections();
      setConnections(items);
    } catch (fetchError) {
      await handleConnectionError(fetchError, "Could not load connected accounts.");
    } finally {
      if (showInitialLoader) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchConnections({ showInitialLoader: true });
  }, [fetchConnections]);

  async function handleConnectYouTube() {
    setError("");
    setConnectHint("");
    setActionLoading("youtube-connect");

    try {
      const startResult = await startYouTubeConnection();

      if (startResult.mockConnected) {
        setConnectHint("Mock YouTube account connected for development.");
        await fetchConnections();
        return;
      }

      if (startResult.url) {
        await WebBrowser.openBrowserAsync(startResult.url);
        setConnectHint("If login was completed, tap Refresh status.");
        await fetchConnections();
        return;
      }

      setConnectHint("YouTube connection could not be started. Please try again.");
      await fetchConnections();
    } catch (connectError) {
      await handleConnectionError(connectError, "Could not start YouTube connection.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDisconnect(connectionId: string) {
    setError("");
    setActionLoading(connectionId);

    try {
      await disconnectAccount(connectionId);
      await fetchConnections();
    } catch (disconnectError) {
      await handleConnectionError(disconnectError, "Could not disconnect account.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTestBackendStatus() {
    setBackendStatus("");
    setActionLoading("backend-status");

    try {
      const status = await checkApiStatus();
      setBackendStatus(`Backend connected: ${status.message}`);
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : "Backend status check failed.";
      setBackendStatus(`${message} API URL: ${API_BASE_URL}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTestGoogleConfig() {
    setConfigStatus("");
    setActionLoading("config-status");

    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          devMockYouTubeAuthEnabled: boolean;
          googleClientIdConfigured: boolean;
          googleClientIdLooksValid: boolean;
          googleClientSecretConfigured: boolean;
          googleRedirectUriConfigured: boolean;
        };
      }>("/status/config");
      const data = response.data.data;
      setConfigStatus(
        `Google config: mock mode ${statusWord(data.devMockYouTubeAuthEnabled)}, client id ${statusWord(data.googleClientIdConfigured)}, client id valid ${statusWord(
          data.googleClientIdLooksValid
        )}, secret ${statusWord(data.googleClientSecretConfigured)}, redirect URI ${statusWord(data.googleRedirectUriConfigured)}.`
      );
    } catch (configError) {
      const message = configError instanceof Error ? configError.message : "Google config status check failed.";
      setConfigStatus(`${message} API URL: ${API_BASE_URL}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleConnectionError(errorValue: unknown, fallbackMessage: string) {
    const rawMessage = errorValue instanceof Error ? errorValue.message : fallbackMessage;
    const message = getFriendlyConnectionError(rawMessage);
    setError(message);
    setFullBackendError(rawMessage);

    if (isAuthError(rawMessage)) {
      await logout();
    }
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Main");
  }

  function handleGoHome() {
    navigation.navigate("Main", { screen: "Home" });
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.navigationRow}>
          <Pressable accessibilityRole="button" onPress={handleBack} style={styles.navButton}>
            <AppText style={styles.refreshText}>Back</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={handleGoHome} style={styles.navButton}>
            <AppText style={styles.refreshText}>Go to Home</AppText>
          </Pressable>
        </View>

        <View style={styles.header}>
          <View style={styles.headerText}>
            <AppText variant="title">Connected Accounts</AppText>
            <AppText muted>Connect accounts so TB81TUBE can fetch your permitted media data through the backend.</AppText>
          </View>
          <Pressable accessibilityRole="button" onPress={() => fetchConnections()} style={styles.refreshButton} disabled={refreshing}>
            {refreshing ? <ActivityIndicator color={colors.text} size="small" /> : <AppText style={styles.refreshText}>Refresh</AppText>}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
            <Pressable accessibilityRole="button" onPress={() => fetchConnections()} style={styles.errorAction}>
              <AppText style={styles.refreshText}>Retry</AppText>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.accent} />
            <AppText muted>Loading connected accounts...</AppText>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <AppText variant="heading">YouTube</AppText>
              <AppText muted>Login with Google to connect your YouTube account.</AppText>
              <AppText muted>Your Google password is never shared with TB81TUBE.</AppText>
            </View>
            <View style={[styles.statusPill, youtubeConnection ? styles.connectedPill : styles.inactivePill]}>
              <AppText style={styles.statusText}>{isMockYouTubeConnection ? "Connected - Development Mock" : youtubeConnection ? "Connected" : "Not connected"}</AppText>
            </View>
          </View>

          {youtubeConnection ? (
            <>
              <View style={styles.accountInfo}>
                <AppText style={styles.accountLabel}>Account</AppText>
                <AppText>{youtubeConnection.platformUserId || "YouTube connected"}</AppText>
              </View>
              <AppButton
                title={actionLoading === youtubeConnection.id ? "Disconnecting..." : "Disconnect"}
                variant="secondary"
                disabled={actionLoading !== null || refreshing}
                onPress={() => handleDisconnect(youtubeConnection.id)}
              />
            </>
          ) : (
            <AppButton
              title={actionLoading === "youtube-connect" ? "Opening Google..." : "Continue with Google"}
              disabled={actionLoading !== null || refreshing}
              onPress={handleConnectYouTube}
            />
          )}
          {connectHint ? <AppText style={styles.successText}>{connectHint}</AppText> : null}
          {isMockYouTubeConnection ? (
            <AppText muted>This is a mock YouTube connection for development. Add Google OAuth credentials for real YouTube login.</AppText>
          ) : null}
          <AppButton
            title={refreshing ? "Refreshing..." : "Refresh status"}
            variant="secondary"
            disabled={refreshing || actionLoading !== null}
            onPress={() => fetchConnections()}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setDeveloperDetailsVisible((currentValue) => !currentValue)}
          style={styles.developerToggle}
        >
          <AppText style={styles.refreshText}>{developerDetailsVisible ? "Hide developer details" : "Show developer details"}</AppText>
        </Pressable>

        {developerDetailsVisible ? (
          <View style={styles.card}>
            <AppText variant="heading">Developer Details</AppText>
            <View style={styles.accountInfo}>
              <AppText style={styles.accountLabel}>API base URL</AppText>
              <AppText>{API_BASE_URL}</AppText>
            </View>
            {backendStatus ? (
              <AppText style={backendStatus.startsWith("Backend connected") ? styles.successText : styles.errorText}>{backendStatus}</AppText>
            ) : null}
            {configStatus ? <AppText style={styles.errorText}>{configStatus}</AppText> : null}
            {fullBackendError ? (
              <View style={styles.accountInfo}>
                <AppText style={styles.accountLabel}>Full backend error</AppText>
                <AppText>{fullBackendError}</AppText>
              </View>
            ) : null}
            <View style={styles.statusActions}>
              <AppButton
                title={actionLoading === "backend-status" ? "Testing..." : "Test backend status"}
                variant="secondary"
                disabled={actionLoading !== null}
                onPress={handleTestBackendStatus}
                style={styles.statusActionButton}
              />
              <AppButton
                title={actionLoading === "config-status" ? "Checking..." : "Google config status"}
                variant="secondary"
                disabled={actionLoading !== null}
                onPress={handleTestGoogleConfig}
                style={styles.statusActionButton}
              />
            </View>
          </View>
        ) : null}
        <FuturePlatformCard name="JioSaavn" />
        <FuturePlatformCard name="Amazon Music" />
        <FuturePlatformCard name="Airtel/Wynk Music" />
        <FuturePlatformCard name="Spotify" />
      </ScrollView>
    </Screen>
  );
}

function getFriendlyConnectionError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot connect to backend") || lowerMessage.includes("network error")) {
    return "Backend not reachable. Check that the backend is running and the API base URL is correct.";
  }

  if (lowerMessage.includes("timed out") || lowerMessage.includes("timeout")) {
    return "Connection request timed out. Check backend terminal and API URL.";
  }

  if (lowerMessage.includes("google oauth is not configured")) {
    return "Google login is not ready yet. Please check backend Google OAuth setup.";
  }

  if (lowerMessage.includes("google oauth credentials are missing")) {
    return "Google login is not ready yet. Please check backend Google OAuth setup.";
  }

  if (lowerMessage.includes("google oauth setup is invalid") || lowerMessage.includes("invalid google client id")) {
    return "Google login is not ready yet. Please check backend Google OAuth setup.";
  }

  if (isAuthError(message)) {
    return "Your login session expired. Please log in again before connecting YouTube.";
  }

  if (lowerMessage.includes("oauth") || lowerMessage.includes("youtube")) {
    return "YouTube connection could not be completed. Please try again.";
  }

  return message;
}

function statusWord(value: boolean) {
  return value ? "ok" : "missing";
}

function isAuthError(message: string) {
  const lowerMessage = message.toLowerCase();

  return lowerMessage.includes("missing authorization token") || lowerMessage.includes("invalid or expired token") || lowerMessage.includes("unauthorized");
}

function FuturePlatformCard({ name }: { name: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <AppText variant="heading">{name}</AppText>
          <AppText muted>Official API access will be added in a future version.</AppText>
        </View>
        <View style={styles.inactivePill}>
          <AppText style={styles.statusText}>Coming soon</AppText>
        </View>
      </View>
    </View>
  );
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
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  navButton: {
    minHeight: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  refreshButton: {
    minHeight: 40,
    minWidth: 82,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm
  },
  refreshText: {
    fontWeight: "700"
  },
  developerToggle: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  statusPill: {
    alignSelf: "flex-start"
  },
  connectedPill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  inactivePill: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700"
  },
  accountInfo: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: spacing.sm,
    gap: 4
  },
  accountLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
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
  successText: {
    color: "#3ddc84"
  },
  statusActions: {
    gap: spacing.sm
  },
  statusActionButton: {
    width: "100%"
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg
  }
});

