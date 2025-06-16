import InfoItemProps from "@/@types/InfoItemProps";
import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InfoItem({ label, value }: InfoItemProps): React.JSX.Element {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || "Não informado"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 12
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "JetBrainsMono_500Medium",
    color: Colors.titleGrey,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.titleGrey,
  },
})