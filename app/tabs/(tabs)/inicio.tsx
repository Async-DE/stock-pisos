import { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { categories } from "../../../components/constants";
import { SearchHeader } from "@/components/SearchHeader";
import { CategoriesGrid } from "@/components/CategoriesGrid";

export default function Inicio() {
  const [searchTerm, setSearchTerm] = useState("");

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
        <SearchHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Contenido: Categorías */}
        <CategoriesGrid categories={filteredCategories} />
      </Box>
    </ScrollView>
  );
}
