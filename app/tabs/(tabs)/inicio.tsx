import { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Dimensions } from "react-native";
import { useRouter } from "expo-router";
import {
  categories,
  getProductsForCategory,
} from "../../../components/constants";
import { SearchHeader } from "@/components/SearchHeader";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { ProductsView } from "@/components/ProductsView";

const { width: screenWidth } = Dimensions.get("window");

export default function Inicio() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Calcular tamaño de los items
  const itemSize = Math.min((screenWidth - 40) / 3, 100);
  const iconBoxSize = itemSize * 0.7;

  // Filtrar categorías basado en la búsqueda
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Obtener datos de categoría seleccionada
  const selectedCategoryData = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;
  const productsInCategory = selectedCategory
    ? getProductsForCategory(selectedCategory)
    : [];

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setSearchTerm(""); // Limpiar búsqueda al cambiar de categoría
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSearchTerm("");
  };

  const handleProductPress = (productId: number) => {
    console.log("Navegando a producto:", productId);
    // Intentar con ruta relativa primero
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
          selectedCategory={selectedCategory}
          selectedCategoryName={selectedCategoryData?.name}
          onBack={handleBack}
        />

        {/* Contenido: Categorías o Productos */}
        {selectedCategory ? (
          <ProductsView
            products={productsInCategory}
            categoryName={selectedCategoryData?.name || ""}
            screenWidth={screenWidth}
            onProductPress={handleProductPress}
          />
        ) : (
          <CategoriesGrid
            categories={filteredCategories}
            onCategoryPress={handleCategoryPress}
            screenWidth={screenWidth}
            itemSize={itemSize}
            iconBoxSize={iconBoxSize}
          />
        )}
      </Box>
    </ScrollView>
  );
}
