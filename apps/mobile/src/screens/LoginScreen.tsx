import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentType } from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput as PaperTextInput } from "react-native-paper";
import { Screen } from "../components/Screen";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../store/authStore";
import type { AuthStackParamList } from "../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;
const TextInput = PaperTextInput as unknown as ComponentType<any>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailError = submitted && !/^\S+@\S+\.\S+$/.test(email.trim());
  const passwordError = submitted && password.length === 0;

  async function submit() {
    setSubmitted(true);
    setFormError(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || !password) {
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email.trim(), password);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.logo}>
          TB81Tube
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Sign in to search, play, and save YouTube videos.
        </Text>
      </View>
      <View style={styles.form}>
        <View>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            error={emailError}
          />
          <HelperText type="error" visible={emailError}>
            Enter a valid email address.
          </HelperText>
        </View>
        <View>
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" error={passwordError} />
          <HelperText type="error" visible={passwordError}>
            Password is required.
          </HelperText>
        </View>
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting}>
          Log in
        </Button>
        <Button mode="text" onPress={() => navigation.navigate("Register")}>
          Create account
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center"
  },
  header: {
    marginBottom: 28
  },
  logo: {
    color: "#e11d48",
    fontWeight: "800"
  },
  subtitle: {
    color: "#667085",
    marginTop: 8
  },
  form: {
    gap: 12
  },
  error: {
    color: "#be123c"
  }
});
