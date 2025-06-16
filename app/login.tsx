import Button from "@/components/Button";
import InputField from "@/components/InputField";
import SubtitleText from "@/components/SubtitleText";
import TitleText from "@/components/TitleText";
import Colors from "@/constants/Colors";
import { auth, signInWithEmailAndPassword } from "@/context/firebase";
import { useUser } from "@/context/user_provider";
import { Alert } from "@/utils/alertUtils";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";

export default function Login(): React.JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.warning("Atenção", "Por favor, preencha email e senha.");
      return;
    }

    try {
      setLoading(true);
      const response = await signInWithEmailAndPassword(auth, email, password);
      setUser(response.user);
      
      setLoading(false);

      router.replace({
        pathname: '/home',
        params: {}
      });
    } catch (error: any) {
      setLoading(false);
      
      let errorMessage = "Ocorreu um erro ao fazer login. Tente novamente.";
      let errorTitle = "Erro de Login";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Formato de email inválido. Verifique o email digitado.";
      } else if (error.code === 'auth/too-many-requests') {
        errorTitle = "Muitas Tentativas";
        errorMessage = "Muitas tentativas de login. Tente novamente mais tarde ou redefina sua senha.";
      }
      
      Alert.error(errorTitle, errorMessage);
    }
  };

  const navigateToRegister = () => {
    router.replace("/register");
  };

  const navigateToForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <View style={style.container}>
      <View style={style.subContainer}>
        <TitleText value="Bem-vindo de volta" />
        <SubtitleText value="Insira seus dados abaixo para acessar sua conta" />
        <InputField 
          value={email} 
          onChange={(text: string) => setEmail(text)} 
          label={"Email"} 
          secure={false}
        />
        <InputField 
          value={password} 
          onChange={(text: string) => setPassword(text)} 
          label={"Senha"} 
          secure={true}
        />
        <TouchableOpacity 
          onPress={navigateToForgotPassword}
          style={style.forgotPasswordButton}
        >
          <Text style={style.forgotPasswordText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
        <Button value={"Entrar"} onPress={handleLogin} loading={loading} />
        <View style={style.registerContainer}>
          <Text style={style.registerText}>Não tem uma conta?</Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={style.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const style = StyleSheet.create({
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginRight: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: Colors.titleGrey,
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 12,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 5,
  },
  registerText: {
    color: Colors.subtitleGrey,
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 14,
  },
  registerLink: {
    color: Colors.titleGrey,
    fontFamily: "JetBrainsMono_600SemiBold",
    fontSize: 14,
  }
})