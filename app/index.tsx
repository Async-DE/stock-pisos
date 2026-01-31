import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from 'react-native';
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from '@/components/ui/icon';
import { createIcon } from '@gluestack-ui/core/icon/creator';
import { Path } from 'react-native-svg';
import { Svg } from '@gluestack-ui/core/icon/creator';

// Create Box/Inventory Icon
const BoxIcon = createIcon({
  Root: Svg,
  viewBox: '0 0 24 24',
  path: (
    <>
      <Path
        d="M21 16V8C21 7.46957 20.7893 6.96086 20.4142 6.58579C20.0391 6.21071 19.5304 6 19 6H5C4.46957 6 3.96086 6.21071 3.58579 6.58579C3.21071 6.96086 3 7.46957 3 8V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H19C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="white"
      />
      <Path
        d="M3 10H21"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="white"
      />
      <Path
        d="M7 14H7.01"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="white"
      />
    </>
  ),
});

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Handle login logic here
    console.log('Login:', { username, password });
  };

  return (
    <Box className="flex-1 bg-gray-200 items-center justify-center px-5">
      {/* White Card Container */}
      <Box className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <VStack space="xl" className="items-center">
          {/* Icon Circle */}
          <Box className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center mb-2">
            <Icon as={BoxIcon} size="xl" className="text-white" />
          </Box>

          {/* Title */}
          <VStack space="sm" className="items-center">
            <Text className="text-3xl font-bold text-black">
              Sistema de Inventario
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Ingresa tus datos para acceder al sistema
            </Text>
          </VStack>

          {/* Form Fields */}
          <VStack space="lg" className="w-full mt-4">
            {/* Username Field */}
            <VStack space="xs">
              <Text className="text-base font-bold text-black">Usuario</Text>
              <Input
                variant="outline"
                size="lg"
                className="border-gray-300 rounded-lg"
              >
                <InputField
                  placeholder="Escribe tu usuario aqui"
                  value={username}
                  onChangeText={setUsername}
                  className="text-base"
                />
              </Input>
            </VStack>

            {/* Password Field */}
            <VStack space="xs">
              <Text className="text-base font-bold text-black">Contrasena</Text>
              <Input
                variant="outline"
                size="lg"
                className="border-gray-300 rounded-lg"
              >
                <InputField
                  secureTextEntry={!showPassword}
                  placeholder="Escribe tu contrasena aqui"
                  value={password}
                  onChangeText={setPassword}
                  className="text-base flex-1"
                />
                <InputSlot className="pr-3">
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="flex-row items-center"
                  >
                    <Icon
                      as={showPassword ? EyeOffIcon : EyeIcon}
                      size="md"
                      className="text-gray-500 mr-1"
                    />
                    <Text className="text-gray-500 text-sm">Mostrar</Text>
                  </Pressable>
                </InputSlot>
              </Input>
            </VStack>

            {/* Login Button */}
            <Button
              size="lg"
              action="primary"
              className="bg-blue-700 rounded-lg mt-4"
              onPress={handleLogin}
            >
              <ButtonIcon as={ArrowRightIcon} className="text-white" />
              <ButtonText className="text-white font-medium text-base">
                Iniciar Sesion
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
