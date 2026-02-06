import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';

export default function Bitacora() {
  return (
    <Center className="flex-1 bg-[#000000]">
      <Box className="items-center">
        <Heading className="font-bold text-2xl text-[#FFD700]">Bitácora</Heading>
        <Divider className="my-[30px] w-[80%] bg-[#FFD700]" />
        <Text className="p-4 text-center text-[#FFD700]">
          Registro de actividades del sistema
        </Text>
      </Box>
    </Center>
  );
}

