import React, { useCallback, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import TitleText from "@/components/TitleText";
import SubtitleText from "@/components/SubtitleText";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { auth, sendPasswordResetEmail } from "@/context/firebase";
import { Ionicons } from '@expo/vector-icons';
import { Alert } from "@/utils/alertUtils";

export default function ForgotPassword(): React.JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async () => {

    if (!email || !email.includes('@')) {
      Alert.warning("Formato Inválido", "Por favor, informe um email válido.");
      return;
    }

    try {
      setLoading(true);
      
      await sendPasswordResetEmail(auth, email);
      
      setLoading(false);
      setEmailSent(true);
    } catch (error: any) {
      console.error('[handleSubmit] Error sending password reset email:', error);
      setLoading(false);
      
      let errorTitle = "Erro";
      let errorMessage = "Ocorreu um erro ao enviar o email de recuperação. Tente novamente.";
      
      if (error.code === 'auth/user-not-found') {
        errorTitle = "Usuário não encontrado";
        errorMessage = "Não encontramos uma conta com este email.";
      } else if (error.code === 'auth/invalid-email') {
        errorTitle = "Email Inválido";
        errorMessage = "Formato de email inválido. Verifique o email digitado.";
      } else if (error.code === 'auth/too-many-requests') {
        errorTitle = "Muitas tentativas";
        errorMessage = "Muitas solicitações. Por favor, tente novamente mais tarde.";
      }
      
      Alert.error(errorTitle, errorMessage);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  const requestResetContent = useCallback(() => {
    return (
      <>
        <TitleText value="Recuperar senha" />
        <SubtitleText value="Informe seu email e enviaremos instruções para redefinir sua senha" />
        <InputField 
          value={email} 
          onChange={(text: string) => setEmail(text)} 
          label={"Email"} 
          secure={false}
          keyboardType="email-address"
        />
        <Button value="Enviar" onPress={handleSubmit} loading={loading} />
        <TouchableOpacity onPress={navigateToLogin} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={18} color={Colors.titleGrey} />
          <Text style={styles.backButtonText}>Voltar ao Login</Text>
        </TouchableOpacity>
      </>
    );
  }, [email, loading]);

  const emailSentContent = useCallback(() => {
    return (
      <>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={60} color={Colors.titleGrey} />
        </View>
        <TitleText value="Email enviado!" />
        <SubtitleText value={`Enviamos instruções de recuperação de senha para ${email}`} />
        <Text style={styles.instructionText}>
          Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          Se não encontrar o email, verifique sua pasta de spam.
        </Text>
        <Button value="Voltar ao Login" onPress={navigateToLogin} loading={false} />
      </>
    );
  }, [email]);

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        {emailSent ? emailSentContent() : requestResetContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundGrey
  },
  subContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 14,
    color: Colors.titleGrey,
    marginLeft: 5,
  },
  iconContainer: {
    backgroundColor: Colors.backgroundGrey,
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
    color: Colors.subtitleGrey,
    lineHeight: 20,
  }
});