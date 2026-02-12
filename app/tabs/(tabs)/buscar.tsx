import { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { SearchHeader } from "@/components/SearchHeader";
import { Center } from "@/components/ui/center";
import { ShoppingBag } from "lucide-react-native";

export default function Buscar() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <ScrollView
      className="flex-1 bg-[#000000]"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 16,
        paddingTop: 8,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Box className="flex-1 px-3">
        {/* Header con búsqueda */}
        <SearchHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={null}
          onBack={() => {}}
        />

        {/* Contenido: Mensaje de búsqueda */}
        <Center className="py-12">
          <Box className="items-center">
            <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
            <Text className="text-gray-400 text-center text-base mt-4 font-medium">
              {searchTerm.trim()
                ? `Búsqueda de "${searchTerm}" - Funcionalidad en desarrollo`
                : "Escribe para buscar productos"}
            </Text>
            <Text className="text-gray-500 text-center text-sm mt-2">
              La búsqueda se conectará con el API próximamente
            </Text>
          </Box>
        </Center>
      </Box>
    </ScrollView>
  );
}
