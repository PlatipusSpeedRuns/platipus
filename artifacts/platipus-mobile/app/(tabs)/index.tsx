import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const STATS = [
  { label: "Games", value: "0" },
  { label: "Runners", value: "0" },
  { label: "Runs", value: "0" },
  { label: "Countries", value: "0" },
];

const FEATURES = [
  {
    icon: "🏆",
    title: "Verified Leaderboards",
    description: "Every run verified by the community with full transparency.",
  },
  {
    icon: "⚡",
    title: "Real-time Updates",
    description: "Leaderboards update instantly when new runs are submitted.",
  },
  {
    icon: "🔓",
    title: "Open Source",
    description: "Fully open source. Run your own instance or contribute.",
  },
  {
    icon: "📱",
    title: "Any Device",
    description: "Access your runs from any device, anywhere.",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <Text style={[styles.heroEyebrow, { color: colors.primaryForeground, opacity: 0.7 }]}>
          Open Source Speedrunning
        </Text>
        <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>
          Platipus
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.primaryForeground, opacity: 0.8 }]}>
          Community-verified leaderboards for every game, every category.
        </Text>
      </View>

      <View style={[styles.statsRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Why Platipus?</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>{feature.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.ctaCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Ready to compete?</Text>
        <Text style={[styles.ctaDesc, { color: colors.mutedForeground }]}>
          Sign in to submit your runs and track your progress on the leaderboards.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 8,
  },
  heroEyebrow: { fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  heroSubtitle: { fontSize: 16, lineHeight: 24, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 12 },
  section: { padding: 24, gap: 16 },
  sectionTitle: { fontSize: 22, fontWeight: "700" },
  featuresGrid: { gap: 12 },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontSize: 15, fontWeight: "600" },
  featureDesc: { fontSize: 14, lineHeight: 20 },
  ctaCard: {
    margin: 24,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    alignItems: "center",
  },
  ctaTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  ctaDesc: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});
