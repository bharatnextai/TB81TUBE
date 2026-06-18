import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { ConnectedAccountsScreen } from "../screens/main/ConnectedAccountsScreen";
import { PlayerScreen } from "../screens/main/PlayerScreen";
import { PlaylistDetailScreen } from "../screens/main/PlaylistDetailScreen";
import { useAuth } from "../store/authStore";
import { colors } from "../theme/colors";
import type { RootStackParamList } from "../types";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.accent,
    text: colors.text,
    border: colors.border
  }
};

export function RootNavigator() {
  const { restoring, user } = useAuth();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {restoring ? (
          <Stack.Screen name="Loading" component={AuthLoadingScreen} />
        ) : user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Player" component={PlayerScreen} />
            <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
            <Stack.Screen name="ConnectedAccounts" component={ConnectedAccountsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthLoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} />
      <AppText muted>Loading TB81TUBE...</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background
  }
});
