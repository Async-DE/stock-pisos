import { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Dimensions } from "react-native";
import { useRouter } from "expo-router";
import {
  categories,
  getProductsForCategory,
} from "../../../components/constants";
import { request } from "@/constants/Request";
import { SearchHeader } from "@/components/SearchHeader";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { ProductsView } from "@/components/ProductsView";

const { width: screenWidth } = Dimensions.get("window");

type Category = (typeof categories)[number];

export default function Inicio() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );

  const normalizedTerm = searchTerm.trim().toLowerCase();

  const allCategories = apiCategories.length > 0 ? apiCategories : categories;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await request("/stock/categorias/ver", "GET");

        if (response.status === 200 && Array.isArray(response.data)) {
          // Mapear respuesta del backend al formato esperado por CategoriesGrid
          const mapped: Category[] = response.data.map(
            (cat: any, index: number) => {
              const fallbackIcon =
                categories[index % categories.length]?.icon ??
                categories[0].icon;

              return {
                id: cat.id,
                name: cat.nombre,
                icon: fallbackIcon,
                subcategories: Array.isArray(cat.subcategorias)
                  ? cat.subcategorias.map((sub: any) => sub.nombre)
                  : [],
              };
            },
          );

          setApiCategories(mapped);
        }
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = allCategories
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
    ? allCategories.find((category) => category.id === selectedCategory)
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

  const handleProductPress = (productId: number) => {
    console.log("Navegando a producto:", productId);
    router.push(`/tabs/(tabs)/producto/${productId}`);
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
            onProductPress={handleProductPress}
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
