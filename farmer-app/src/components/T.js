import { Text } from "react-native";
import { useTranslate } from "../hooks/useTranslate";

export default function T({ children, style }) {
  const translated = useTranslate(children);
  return <Text style={style}>{translated}</Text>;
}
