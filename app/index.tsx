import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "react-native";
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { Center } from "@/components/ui/center";
import { Image } from "react-native";
import { Dimensions } from "react-native";
import { request } from "@/constants/Request";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth } = Dimensions.get("window");


export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

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

      if (response.status === 200 && response.token && response.usuario) {
        const { token, usuario } = response;

        await AsyncStorage.multiSet([
          ["token", token],
          ["user_id", String(usuario.id)],
          ["user_usuario", usuario.usuario ?? ""],
          ["user_nombre", usuario.nombre ?? ""],
        ]);

        router.push("/tabs/(tabs)/inicio");
      }
    } catch (error) {
      // El toast de request ya maneja mensajes de error
      console.error("Error en login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-black items-center justify-center px-5">
      {/* White Card Container */}
      <Box className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-lg border-2 border-[#FFD700]">
        <VStack space="xl" className="items-center">
      <Center className="mt-4 mb-5 rounded-full">
        <Box className="rounded-full">
          <Image
            source={require("@/assets/images/Pisos-logo1.png")}
            style={{
              width: screenWidth < 375 ? 300 : 350,
              height: screenWidth < 375 ? 90 : 105,
              resizeMode: "contain",
            }}
          />
        </Box>
      </Center>

          {/* Title */}
          <VStack space="sm" className="items-center w-full justify-center">
            <Text className="text-base text-[#B8860B] text-center w-full">
              Ingresa tus datos para acceder al sistema
            </Text>
          </VStack>

          {/* Form Fields */}
          <VStack space="lg" className="w-full mt-4">
            {/* Username Field */}
            <VStack space="xs">
              <Text className="text-base font-bold text-white">Usuario</Text>
              <Input
                variant="outline"
                size="lg"
                className={`rounded-lg ${
                  errors.username ? 'border-red-500' : 'border-[#B8860B]'
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
              <Text className="text-base font-bold text-white">Contraseña</Text>
              <Input
                variant="outline"
                size="lg"
                className={`rounded-lg ${
                  errors.password ? 'border-red-500' : 'border-[#B8860B]'
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
                      className="text-[#B8860B] mr-1"
                    />
                    <Text className="text-[#B8860B] text-sm">Mostrar</Text>
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
              className="bg-[#FFD700] rounded-lg mt-4"
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
    </Box>
  );
}
