import { useState, useMemo } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { productsByCategory } from "@/components/constants";
import { SearchHeader } from "@/components/SearchHeader";
import { ProductsView } from "@/components/ProductsView";
import { Center } from "@/components/ui/center";
import { ShoppingBag } from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function Buscar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener todos los productos de todas las categorías
  const allProducts = useMemo(() => {
    const products = [];
    for (const categoryProducts of Object.values(productsByCategory)) {
      products.push(...categoryProducts);
    }
    return products;
  }, []);

  // Filtrar productos basado en la búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, allProducts]);

  const handleProductPress = (productId: number) => {
    console.log("Navegando a producto:", productId);
    const route = `./producto/${productId}`;
    console.log("Ruta a navegar:", route);
    router.push(route as any);
  };

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

        {/* Contenido: Productos filtrados o mensaje vacío */}
        {searchTerm.trim() ? (
          filteredProducts.length > 0 ? (
            <ProductsView
              products={filteredProducts}
              categoryName={`Resultados para "${searchTerm}"`}
              screenWidth={screenWidth}
              onProductPress={handleProductPress}
            />
          ) : (
            <Center className="py-12">
              <Box className="items-center">
                <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
                <Text className="text-gray-400 text-center text-base mt-4 font-medium">
                  No se encontraron productos para "{searchTerm}"
                </Text>
              </Box>
            </Center>
          )
        ) : (
          <Center className="py-12">
            <Box className="items-center">
              <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-400 text-center text-base mt-4 font-medium">
                Escribe para buscar productos
              </Text>
            </Box>
          </Center>
        )}
      </Box>
    </ScrollView>
  );
}
