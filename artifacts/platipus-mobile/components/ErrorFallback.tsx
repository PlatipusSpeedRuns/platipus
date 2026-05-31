import { Feather } from "@expo/vector-icons";
import { reloadAppAsync } from "expo";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch {
      resetError();
    }
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {__DEV__ ? (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={({ pressed }) => [
            styles.topButton,
            { top: insets.top + 16, backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="alert-circle" size={20} color={colors.foreground} />
        </Pressable>
      ) : null}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Something went wrong</Text>
        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          Please reload the app to continue.
        </Text>
        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Try Again</Text>
        </Pressable>
      </View>

      {__DEV__ ? (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Error Details</Text>
                <Pressable onPress={() => setIsModalVisible(false)}>
                  <Feather name="x" size={24} color={colors.foreground} />
                </Pressable>
              </View>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}>
                <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
                  <Text style={{ color: colors.foreground, fontFamily: monoFont, fontSize: 12, lineHeight: 18 }} selectable>
                    {`Error: ${error.message}\n\n${error.stack ?? ""}`}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  content: { alignItems: "center", gap: 16, width: "100%", maxWidth: 600 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  message: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  topButton: { position: "absolute", right: 16, width: 44, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center", zIndex: 10 },
  button: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 8, minWidth: 200 },
  buttonText: { fontWeight: "600", textAlign: "center", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { width: "100%", height: "90%", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: "600" },
  errorContainer: { borderRadius: 8, padding: 16 },
});
