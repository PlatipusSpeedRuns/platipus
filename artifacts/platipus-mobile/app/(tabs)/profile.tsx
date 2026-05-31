import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";

import { useColors } from "@/hooks/useColors";

function SignedInView() {
  const colors = useColors();
  const { signOut } = useAuth();
  const { user } = useUser();

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";

  const displayName =
    user?.fullName ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "Runner";

  return (
    <View style={styles.signedInContainer}>
      <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
        <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{initials}</Text>
      </View>

      <Text style={[styles.userName, { color: colors.foreground }]}>{displayName}</Text>
      {user?.emailAddresses?.[0]?.emailAddress ? (
        <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
          {user.emailAddresses[0].emailAddress}
        </Text>
      ) : null}

      <View style={styles.statsRow}>
        {[
          { label: "Runs", value: "0" },
          { label: "WRs", value: "0" },
          { label: "Games", value: "0" },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.muted }]}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => signOut()}
        style={({ pressed }) => [
          styles.signOutBtn,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign out</Text>
      </Pressable>
    </View>
  );
}

function SignedOutView() {
  const colors = useColors();
  const router = useRouter();

  return (
    <View style={styles.signedOutContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
        <Feather name="user" size={32} color={colors.mutedForeground} />
      </View>

      <Text style={[styles.signedOutTitle, { color: colors.foreground }]}>Join Platipus</Text>
      <Text style={[styles.signedOutDesc, { color: colors.mutedForeground }]}>
        Sign in to submit runs, track records, and compete on global leaderboards.
      </Text>

      <Pressable
        onPress={() => router.push("/sign-in")}
        style={({ pressed }) => [
          styles.primaryBtn,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Sign in</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/sign-up")}
        style={({ pressed }) => [
          styles.secondaryBtn,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Create account</Text>
      </Pressable>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {isSignedIn ? <SignedInView /> : <SignedOutView />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContainer: { flexGrow: 1 },
  signedInContainer: { padding: 24, alignItems: "center", gap: 12 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { fontSize: 28, fontWeight: "700" },
  userName: { fontSize: 20, fontWeight: "700" },
  userEmail: { fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 8, width: "100%" },
  statCard: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 12 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  signOutText: { fontSize: 14, fontWeight: "600" },
  signedOutContainer: { padding: 32, alignItems: "center", gap: 12, flex: 1, justifyContent: "center" },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  signedOutTitle: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  signedOutDesc: { fontSize: 14, lineHeight: 22, textAlign: "center", maxWidth: 280 },
  primaryBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "600" },
  secondaryBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "600" },
});
