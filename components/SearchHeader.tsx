import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "react-native";
import { Search, ArrowLeft, Home } from "lucide-react-native";
import { Dimensions } from "react-native";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (text: string) => void;
  selectedCategory?: number | null;
  selectedCategoryName?: string;
  onBack?: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

export function SearchHeader({
  searchTerm,
  onSearchChange,
  selectedCategory,
  selectedCategoryName,
  onBack,
}: SearchHeaderProps) {
  const hasCategory = Boolean(selectedCategory);
  const showBack = hasCategory && typeof onBack === "function";

  return (
    <>
      {/* Logo de la compañía */}
      <Center className="mt-2 mb-4">
        <Box className="flex-row items-center justify-center">
          <Box className="bg-yellow-400 rounded-full p-2 mr-2">
            <Home size={26} color="#000000" strokeWidth={2.5} />
          </Box>
          <Text
            className="text-white text-2xl font-bold"
            style={{ fontSize: screenWidth < 375 ? 22 : 28 }}
          >
            MercaFácil
          </Text>
        </Box>
      </Center>

      {/* Barra de búsqueda */}
      <Box className="mb-5">
        <HStack
          space="sm"
          reversed={false}
          className="items-center bg-secondary-400 py-2.5 px-3 rounded-lg border-2 border-yellow-400"
        >
          {showBack ? (
            <Pressable onPress={onBack}>
              <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
          ) : (
            <Search size={22} color="#FFFFFF" strokeWidth={2} />
          )}
          <Input
            variant="outline"
            size="sm"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
            className="flex-1 border-0"
          >
            <InputField
              placeholder={
                hasCategory
                  ? `Buscar en ${selectedCategoryName || "categoria"}...`
                  : "Buscar..."
              }
              value={searchTerm}
              onChangeText={onSearchChange}
              className="text-sm placeholder:text-gray-300"
              placeholderTextColor="#9CA3AF"
            />
          </Input>
        </HStack>
      </Box>
    </>
  );
}
