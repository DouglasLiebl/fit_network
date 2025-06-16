import TextComponentsProps from "@/@types/TextComponentsProps";
import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text } from "react-native";


export default function TitleText({ value }: TextComponentsProps): React.JSX.Element {
  return <Text style={style.title} >{value}</Text>
}

const style = StyleSheet.create({
  title: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 24,
    color: Colors.titleGrey,
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: "center"
  }
})