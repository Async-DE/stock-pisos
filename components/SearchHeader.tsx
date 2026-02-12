import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Pressable, Image } from "react-native";
import { Search, ArrowLeft } from "lucide-react-native";
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
      <Center className="mt-10 mb-5 rounded-full">
        <Box className="rounded-full">
          <Image
            source={require("@/assets/images/Pisos-logo2.jpeg")}
            style={{
              width: screenWidth < 375 ? 300 : 350,
              height: screenWidth < 375 ? 90 : 105,
              borderRadius: 10,
            }}
          />
        </Box>
      </Center>

      {/* Barra de búsqueda */}
      <Box className="mb-5">
        <HStack
          space="sm"
          reversed={false}
          className="items-center bg-secondary-500/70 py-2 px-3 rounded-full border border-yellow-400"
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
