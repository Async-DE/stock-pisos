import React, { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { Pressable, ImageBackground, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { Center } from "@/components/ui/center";
import { Image } from "react-native";
import { Dimensions } from "react-native";
import { request } from "@/constants/Request";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePermissions } from "@/contexts/PermissionsContext";

const { width: screenWidth } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const { setRole } = usePermissions();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  // Verificar si hay sesión guardada al montar el componente
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const savedPermisos = await AsyncStorage.getItem("user_permisos");
        if (token) {
          // Restaurar permisos si hay sesión guardada
          if (savedPermisos && (savedPermisos === "owner" || savedPermisos === "admin" || savedPermisos === "seller")) {
            await setRole(savedPermisos);
          }
          // Hay sesión guardada, ir directamente al inicio
          console.log("Sesión encontrada, redirigiendo a inicio...");
          router.replace("/tabs/(tabs)/inicio");
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, []);

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
    };

    if (!username.trim()) {
      newErrors.username = "El usuario es requerido";
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 4) {
      newErrors.password = "La contraseña debe tener al menos 4 caracteres";
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm() || isLoading) return;

    try {
      setIsLoading(true);

      const response = await request("/stock/auth/login", "POST", {
        usuario_email: username,
        password,
      });

      console.log("Login response:", JSON.stringify(response, null, 2));

      // La respuesta del endpoint tiene esta estructura:
      // {
      //   "message": "Login exitoso",
      //   "data": {
      //     "token": "...",
      //     "usuario": {...}
      //   }
      // }
      // Y la función request devuelve { status, data } donde data es el JSON completo
      
      let token: string | null = null;
      let usuario: any = null;

      // Extraer token y usuario de response.data.data (el data anidado del endpoint)
      if (response.data?.data?.token && response.data?.data?.usuario) {
        token = response.data.data.token;
        usuario = response.data.data.usuario;
      }
      // Fallback: si la estructura es diferente
      else if (response.data?.token && response.data?.usuario) {
        token = response.data.token;
        usuario = response.data.usuario;
      }

      if (response.status === 200 && token && usuario) {
        console.log("Token recibido:", token ? "Sí" : "No");
        console.log("Usuario recibido:", usuario ? "Sí" : "No");

        // Guardar permisos del usuario
        const permisos = usuario.permisos || "seller";
        await setRole(permisos);

        await AsyncStorage.multiSet([
          ["token", token],
          ["user_id", String(usuario.id || "")],
          ["user_usuario", usuario.usuario ?? ""],
          ["user_nombre", usuario.nombre ?? ""],
          ["user_email_phone", usuario.email_phone ?? ""],
          ["user_estado", String(usuario.estado || "")],
          ["user_permisos", permisos],
          ["user_createdAt", usuario.createdAt ?? ""],
          ["user_updatedAt", usuario.updatedAt ?? ""],
        ]);

        console.log("Navegando a inicio...");
        // Usar replace en lugar de push para evitar que el usuario pueda volver al login
        router.replace("/tabs/(tabs)/inicio");
      } else {
        console.error("Login fallido - Status:", response.status);
        console.error("Token:", token ? "Presente" : "Ausente");
        console.error("Usuario:", usuario ? "Presente" : "Ausente");
        console.error("Response data:", response.data);
      }
    } catch (error) {
      // El toast de request ya maneja mensajes de error
      console.error("Error en login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/madera.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Box className="flex-1 items-center justify-center px-5 py-8">
            {/* Mostrar loader mientras se verifica sesión */}
            {isCheckingSession ? (
              <Center className="flex-1">
                <Text className="text-white text-lg">Verificando sesión...</Text>
              </Center>
            ) : (
              /* White Card Container */
              <Box className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-lg border-2 border-[#13E000]">
                <VStack space="xl" className="items-center">
                  <Center className="mt-4 mb-5 rounded-full">
                    <Box className="rounded-full">
                      <Image
                        source={require("@/assets/images/Pisos-logo2.png")}
                        style={{
                          width: screenWidth < 375 ? 300 : 350,
                          height: screenWidth < 375 ? 90 : 105,
                          borderRadius: 10,
                        }}
                      />
                    </Box>
                  </Center>

                  {/* Title */}
                  <VStack space="sm" className="items-center w-full justify-center">
                    <Text className="text-base text-[#169500] text-center w-full">
                      Ingresa tus datos para acceder al sistema
                    </Text>
                  </VStack>

                  {/* Form Fields */}
                  <VStack space="lg" className="w-full mt-4">
                    {/* Username Field */}
                    <VStack space="xs">
                      <Text className="text-base font-bold text-white">
                        Usuario
                      </Text>
                      <Input
                        variant="outline"
                        size="lg"
                        className={`rounded-lg ${
                          errors.username ? "border-red-500" : "border-[#169500]"
                        }`}
                      >
                        <InputField
                          placeholder="Escribe tu usuario aquí"
                          value={username}
                          onChangeText={(text) => {
                            setUsername(text);
                            if (errors.username) {
                              setErrors({ ...errors, username: "" });
                            }
                          }}
                          className="text-base text-white"
                        />
                      </Input>
                      {errors.username && (
                        <Text className="text-red-500 text-sm mt-1">
                          {errors.username}
                        </Text>
                      )}
                    </VStack>

                    {/* Password Field */}
                    <VStack space="xs">
                      <Text className="text-base font-bold text-white">
                        Contraseña
                      </Text>
                      <Input
                        variant="outline"
                        size="lg"
                        className={`rounded-lg ${
                          errors.password ? "border-red-500" : "border-[#169500]"
                        }`}
                      >
                        <InputField
                          secureTextEntry={!showPassword}
                          placeholder="Escribe tu contraseña aquí"
                          value={password}
                          onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) {
                              setErrors({ ...errors, password: "" });
                            }
                          }}
                          className="text-base flex-1 text-white"
                        />
                        <InputSlot className="pr-3">
                          <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            className="flex-row items-center"
                          >
                            <Icon
                              as={showPassword ? EyeOffIcon : EyeIcon}
                              size="md"
                              className="text-[#169500] mr-1"
                            />
                            <Text className="text-[#169500] text-sm">Mostrar</Text>
                          </Pressable>
                        </InputSlot>
                      </Input>
                      {errors.password && (
                        <Text className="text-red-500 text-sm mt-1">
                          {errors.password}
                        </Text>
                      )}
                    </VStack>

                    {/* Login Button */}
                    <Button
                      size="lg"
                      action="primary"
                      className="bg-[#13E000] rounded-lg mt-4"
                      onPress={handleLogin}
                      isDisabled={isLoading}
                    >
                      <ButtonIcon as={ArrowRightIcon} className="text-black" />
                      <ButtonText className="text-black font-medium text-base">
                        {isLoading ? "Ingresando..." : "Iniciar Sesión"}
                      </ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            )}
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
