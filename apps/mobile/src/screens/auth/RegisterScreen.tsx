import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { API_BASE_URL } from "../../config/api";
import { checkApiStatus } from "../../services/apiClient";
import { useAuth } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { AuthStackParamList } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { error, loading, register, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendStatus, setBackendStatus] = useState("");
  const [testingBackend, setTestingBackend] = useState(false);

  async function handleRegister() {
    clearError();
    await register(name.trim(), email.trim(), password);
  }

  async function handleTestBackend() {
    setBackendStatus("");
    setTestingBackend(true);

    try {
      const status = await checkApiStatus();
      setBackendStatus(`Backend connected: ${status.message}`);
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : "Backend connection test failed.";
      setBackendStatus(`${message} API URL: ${API_BASE_URL}`);
    } finally {
      setTestingBackend(false);
    }
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Create Account</AppText>
        <AppText muted>Start building your TB81TUBE library.</AppText>
      </View>

      <View style={styles.form}>
        <TextInput
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={name}
        />
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
        {backendStatus ? <AppText style={backendStatus.startsWith("Backend connected") ? styles.success : styles.error}>{backendStatus}</AppText> : null}
      </View>

      <View style={styles.actions}>
        <AppButton
          title={testingBackend ? "Testing backend..." : "Test Backend Connection"}
          variant="secondary"
          disabled={testingBackend || loading}
          onPress={handleTestBackend}
        />
        <AppButton title={loading ? "Creating account..." : "Create account"} disabled={loading} onPress={handleRegister} />
        <AppButton title="Go to Login" variant="secondary" disabled={loading} onPress={() => navigation.goBack()} />
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
  success: {
    color: "#3ddc84"
  },
  actions: {
    gap: spacing.md
  }
});
