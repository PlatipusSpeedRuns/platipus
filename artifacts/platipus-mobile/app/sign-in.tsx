import { useSignIn } from "@clerk/expo";
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

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mfaCode, setMfaCode] = React.useState("");

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) return;
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const factor = signIn.supportedSecondFactors?.find(
        (f: any) => f.strategy === "email_code",
      );
      if (factor) await signIn.mfa.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code: mfaCode });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) return;
          router.replace(url as any);
        },
      });
    }
  };

  const isLoading = fetchStatus === "fetching";

  if (signIn.status === "needs_client_trust") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.flex, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.foreground }]}>Verify your identity</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Enter the code sent to your email
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={mfaCode}
            onChangeText={setMfaCode}
            placeholder="Verification code"
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
            disabled={!mfaCode || isLoading}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, opacity: pressed || !mfaCode || isLoading ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Verify</Text>
          </Pressable>
          <Pressable onPress={() => signIn.mfa.sendEmailCode()} style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: colors.mutedForeground }]}>Resend code</Text>
          </Pressable>
          <Pressable onPress={() => signIn.reset()} style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: colors.mutedForeground }]}>Start over</Text>
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
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Sign in to your Platipus account
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
        {errors?.fields?.identifier && (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {errors.fields.identifier.message}
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
          autoComplete="current-password"
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
            {isLoading ? "Signing in…" : "Sign in"}
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/sign-up">
            <Text style={[styles.linkText, { color: colors.foreground }]}>Sign up</Text>
          </Link>
        </View>
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
