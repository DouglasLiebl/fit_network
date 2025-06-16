import TextComponentsProps from "@/@types/TextComponentsProps";
import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text } from "react-native";

export default function SubtitleText({ value }: TextComponentsProps): React.JSX.Element {
  return <Text style={style.subtitle} >{ value }</Text>
}

const style = StyleSheet.create({
  subtitle: {
    fontFamily: "JetBrainsMono_300Light",
    fontSize: 15,
    textAlign: "center",
    color: Colors.subtitleGrey
  }
})