import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, TextInput, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { useAuth } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { AuthStackParamList } from "../../types";
import { useState } from "react";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { error, loading, login, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    clearError();
    await login(email.trim(), password);
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">TB81TUBE</AppText>
        <AppText muted>Sign in to continue watching and saving videos.</AppText>
      </View>

      <View style={styles.form}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? <AppText style={styles.error}>{error}</AppText> : null}
      </View>

      <View style={styles.actions}>
        <AppButton title={loading ? "Logging in..." : "Login"} disabled={loading} onPress={handleLogin} />
        <AppButton title="Go to Register" variant="secondary" disabled={loading} onPress={() => navigation.navigate("Register")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    gap: spacing.xl
  },
  header: {
    gap: spacing.sm
  },
  form: {
    gap: spacing.md
  },
  input: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 16
  },
  error: {
    color: colors.accent
  },
  actions: {
    gap: spacing.md
  }
});
