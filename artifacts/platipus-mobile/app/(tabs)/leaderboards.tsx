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

const FILTERS = ["All", "Recent", "Top Runs", "My Runs"];

export default function LeaderboardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = React.useState("All");

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Leaderboards</Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          Verified world records and personal bests
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((f) => (
          <View
            key={f}
            onTouchEnd={() => setActiveFilter(f)}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === f ? colors.primary : colors.muted,
                borderColor: activeFilter === f ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === f ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {f}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
          <Feather name="award" size={32} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No runs yet</Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
          Be the first to submit a run and claim the top spot.
        </Text>
      </View>

      <View style={[styles.howItWorks, { borderColor: colors.border }]}>
        <Text style={[styles.howTitle, { color: colors.foreground }]}>How runs work</Text>
        {[
          { icon: "video", text: "Record your run with proof" },
          { icon: "upload", text: "Submit with time and video link" },
          { icon: "check-circle", text: "Community verifies your run" },
          { icon: "award", text: "Claim your spot on the board" },
        ].map((step) => (
          <View key={step.text} style={styles.howStep}>
            <Feather name={step.icon as any} size={16} color={colors.mutedForeground} />
            <Text style={[styles.howText, { color: colors.mutedForeground }]}>{step.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  header: { padding: 24, paddingBottom: 16, gap: 4 },
  heading: { fontSize: 28, fontWeight: "700" },
  subheading: { fontSize: 14 },
  filtersRow: { paddingHorizontal: 16, paddingBottom: 16, gap: 8, flexDirection: "row" },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "500" },
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
  howItWorks: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  howTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  howStep: { flexDirection: "row", alignItems: "center", gap: 12 },
  howText: { fontSize: 14 },
});
