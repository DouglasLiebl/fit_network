import Button from "@/components/Button";
import InputField from "@/components/InputField";
import SubtitleText from "@/components/SubtitleText";
import TitleText from "@/components/TitleText";
import Colors from "@/constants/Colors";
import { auth } from "@/context/firebase";
import { useUser } from "@/context/user_provider";
import { Alert } from "@/utils/alertUtils";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

export default function Register(): React.JSX.Element {
  console.log('[Register] Component initializing');
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { setUser } = useUser();
  const db = getFirestore();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.warning("Atenção", "Por favor, preencha email e senha.");
      return;
    }

    try {
      setLoading(true);
      const response = await createUserWithEmailAndPassword(auth, email, password);
      
      const userId = response.user.uid;
      
      try {
        await setDoc(doc(db, "users", userId), {
          userId: userId,
          email: email,
          phoneNumber: phoneNumber || null,
          displayName: response.user.displayName || null,
          photoURL: response.user.photoURL || null,
          emailVerified: response.user.emailVerified,
          createdAt: new Date(),
          lastLogin: new Date(),
          isActive: true
        });
      } catch (firestoreError: any) {
        console.error('[handleRegister] Firestore error:', firestoreError);
      }

      setUser(response.user);
      setLoading(false);
      
      Alert.success("Sucesso", "Usuário registrado com sucesso!", [
        { 
          text: "OK", 
          onPress: () => {
            console.log('[handleRegister] Alert confirmed, navigating to home');
            router.replace('/home');
          }
        }
      ]);
    } catch (error: any) {
      setLoading(false);
      
      let errorMessage = error.message;
      let errorType = "Erro";
      
      if (error.code === 'auth/email-already-in-use') {
        errorType = "Email Já Utilizado";
        errorMessage = "Este email já está em uso. Por favor, utilize outro email.";
      } else if (error.code === 'auth/weak-password') {
        errorType = "Senha Fraca";
        errorMessage = "Senha muito fraca. Por favor, use uma senha mais forte.";
      } else if (error.code === 'auth/invalid-email') {
        errorType = "Email Inválido";
        errorMessage = "Formato de email inválido. Por favor, verifique o email digitado.";
      } else if (error.message.includes('permissions')) {
        errorType = "Erro de Permissão";
        errorMessage = "Erro de permissão ao salvar dados do usuário. Entre em contato com o suporte.";
      }
      
      Alert.error(errorType, errorMessage);
    }
  };

  return (
    <View style={style.container}>
      <View style={style.subContainer}>
        <TitleText value="Crie sua conta" />
        <SubtitleText value="Preencha os campos abaixo para começar a gerenciar suas despesas pessoais" />
        <InputField 
          value={email} 
          onChange={(text: any) => {
            console.log('[Register] Email changed');
            setEmail(text);
          }} 
          label={"Email"} 
          secure={false}
        />
        <InputField 
          value={password} 
          onChange={(text: any) => {
            console.log('[Register] Password changed');
            setPassword(text);
          }} 
          label={"Senha"} 
          secure={true} 
        />
        <InputField 
          value={phoneNumber} 
          onChange={(text: any) => {
            console.log('[Register] Phone number changed');
            setPhoneNumber(text);
          }} 
          label={"Telefone (opcional)"} 
          secure={false}
        />
        <Button value={"Criar Conta"} onPress={handleRegister} loading={loading} />
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundGrey
  },
  subContainer: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    width: "80%",
  }
})