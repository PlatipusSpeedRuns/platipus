import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function SignUpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const isLoading = fetchStatus === "fetching";

  const handleSubmit = async () => {
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;
    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) return;
          router.replace(url as any);
        },
      });
    }
  };

  if (isSignedIn) return null;

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    signUp.missingFields?.length === 0
  ) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.flex, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.foreground }]}>Verify your email</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We sent a code to {email}
          </Text>

          <Text style={[styles.label, { color: colors.foreground }]}>Verification code</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={code}
            onChangeText={setCode}
            placeholder="Enter code"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            autoComplete="one-time-code"
          />
          {errors?.fields?.code && (
            <Text style={[styles.error, { color: colors.destructive }]}>
              {errors.fields.code.message}
            </Text>
          )}

          <Pressable
            onPress={handleVerify}
            disabled={!code || isLoading}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, opacity: pressed || !code || isLoading ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
              {isLoading ? "Verifying…" : "Verify email"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => signUp.verifications.sendEmailCode()}
            style={styles.linkBtn}
          >
            <Text style={[styles.linkText, { color: colors.mutedForeground }]}>Resend code</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Join Platipus and start competing
        </Text>

        <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        {errors?.fields?.emailAddress && (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {errors.fields.emailAddress.message}
          </Text>
        )}

        <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          autoComplete="new-password"
        />
        {errors?.fields?.password && (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {errors.fields.password.message}
          </Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={!email || !password || isLoading}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.primary, opacity: pressed || !email || !password || isLoading ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
            {isLoading ? "Creating account…" : "Sign up"}
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
          </Text>
          <Link href="/sign-in">
            <Text style={[styles.linkText, { color: colors.foreground }]}>Sign in</Text>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 24, gap: 8 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginTop: 8 },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  error: { fontSize: 12, marginTop: 2 },
  btn: { paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  btnText: { fontSize: 16, fontWeight: "600" },
  linkBtn: { paddingVertical: 8, alignItems: "center" },
  linkText: { fontSize: 14, fontWeight: "500" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8, flexWrap: "wrap" },
  footerText: { fontSize: 14 },
});
