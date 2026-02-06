import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Grid3x3 } from "lucide-react-native";

import { Input, InputField } from "@/components/ui/input";

export default function Inicio() {
  return (
    <Center className="flex-1 bg-[#000000]">
      <HStack
        space="xl"
        reversed={false}
        className=" px-5 m-6 items-center bg-primary-600 py-4 rounded-2xl"
      >
        <Text className="font-semibold text-white">Buscar</Text>
        <Input
          variant="outline"
          size="md"
          isDisabled={false}
          isInvalid={false}
          isReadOnly={false}
          className="flex-1"
        >
          <InputField placeholder="Buscar una categoria..." />
        </Input>
      </HStack>

      <Box className="items-center">
        <HStack space="lg" reversed={false} className="mt-8">
          
          <Box className="h-32 w-32 rounded-2xl justify-center items-center">
            <Box className="h-24 w-24 bg-primary-600 rounded-2xl justify-center items-center">
              <Grid3x3 size={50} color="#FFD700" />
            </Box>
            <Text className="text-white text-center mt-12">Pisos</Text>
          </Box>

          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
        </HStack>
        <HStack space="lg" reversed={false} className="mt-8">
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
        </HStack>
        <HStack space="lg" reversed={false} className="mt-8">
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
        </HStack>
        <HStack space="lg" reversed={false} className="mt-8">
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
          <Box className="h-32 w-32 bg-primary-400 rounded-2xl" />
        </HStack>
      </Box>
    </Center>
  );
}
