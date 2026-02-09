import { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Dimensions } from "react-native";
import {
  categories,
  getProductsForCategory,
} from "../../../components/constants";
import { SearchHeader } from "@/components/SearchHeader";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { ProductsView } from "@/components/ProductsView";

const { width: screenWidth } = Dimensions.get("window");

export default function Inicio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );

  const normalizedTerm = searchTerm.trim().toLowerCase();

  const filteredCategories = categories
    .map((category) => {
      const subcategories = category.subcategories ?? [];
      const matchesCategory = normalizedTerm
        ? category.name.toLowerCase().includes(normalizedTerm)
        : true;
      const matchingSubcategories = normalizedTerm
        ? subcategories.filter((subcategory) =>
            subcategory.toLowerCase().includes(normalizedTerm),
          )
        : subcategories;

      if (!normalizedTerm) {
        return category;
      }

      if (matchesCategory) {
        return category;
      }

      if (matchingSubcategories.length > 0) {
        return { ...category, subcategories: matchingSubcategories };
      }

      return null;
    })
    .filter(Boolean) as typeof categories;

  const selectedCategoryData = selectedCategory
    ? categories.find((category) => category.id === selectedCategory)
    : null;
  const productsInCategory = selectedCategory
    ? getProductsForCategory(selectedCategory)
    : [];

  const handleSubcategoryPress = (categoryId: number, subcategory: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategory);
    setSearchTerm("");
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchTerm("");
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
            categoryName={
              selectedSubcategory
                ? `${selectedCategoryData?.name || ""} / ${selectedSubcategory}`
                : selectedCategoryData?.name || ""
            }
            screenWidth={screenWidth}
          />
        ) : (
          <CategoriesGrid
            categories={filteredCategories}
            onSubcategoryPress={handleSubcategoryPress}
          />
        )}
      </Box>
    </ScrollView>
  );
}
