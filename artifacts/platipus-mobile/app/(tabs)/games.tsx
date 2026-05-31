import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Games</Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          Browse games with active leaderboards
        </Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
          Search games...
        </Text>
      </View>

      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
          <Feather name="monitor" size={32} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No games yet</Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
          Games will appear here once they are added to the platform.
        </Text>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.infoTitle, { color: colors.foreground }]}>Add a game</Text>
        <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>
          Know a speedgame that should be on Platipus? Sign in and request a new game to get started.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  header: { padding: 24, paddingBottom: 16, gap: 4 },
  heading: { fontSize: 28, fontWeight: "700" },
  subheading: { fontSize: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchPlaceholder: { fontSize: 14 },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  emptyDesc: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  infoCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  infoTitle: { fontSize: 16, fontWeight: "600" },
  infoDesc: { fontSize: 14, lineHeight: 20 },
});
