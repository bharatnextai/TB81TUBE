import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentType } from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput as PaperTextInput } from "react-native-paper";
import { Screen } from "../components/Screen";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../store/authStore";
import type { AuthStackParamList } from "../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;
const TextInput = PaperTextInput as unknown as ComponentType<any>;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const nameError = submitted && name.trim().length === 0;
  const emailError = submitted && !/^\S+@\S+\.\S+$/.test(email.trim());
  const passwordError = submitted && password.length < 8;

  async function submit() {
    setSubmitted(true);
    setFormError(null);

    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 8) {
      return;
    }

    try {
      setSubmitting(true);
      await signUp(name.trim(), email.trim(), password);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Create account
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Your local library starts here.
        </Text>
      </View>
      <View style={styles.form}>
        <View>
          <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" error={nameError} />
          <HelperText type="error" visible={nameError}>
            Name is required.
          </HelperText>
        </View>
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
            Password must be at least 8 characters.
          </HelperText>
        </View>
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting}>
          Sign up
        </Button>
        <Button mode="text" onPress={() => navigation.goBack()}>
          Back to login
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
    marginBottom: 24
  },
  title: {
    color: "#111827",
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
