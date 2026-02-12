import { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Dimensions } from "react-native";
import { useRouter } from "expo-router";
import {
  categories,
  type Product,
} from "../../../components/constants";
import { request } from "@/constants/Request";
import { SearchHeader } from "@/components/SearchHeader";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { ProductsView } from "@/components/ProductsView";

const { width: screenWidth } = Dimensions.get("window");

type Subcategory = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
  icon: (typeof categories)[number]["icon"];
  subcategories: Subcategory[];
};

export default function Inicio() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const normalizedTerm = searchTerm.trim().toLowerCase();

  // Convert fallback categories to match the expected structure
  const fallbackCategories: Category[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    subcategories: cat.subcategories.map((sub, index) => ({
      id: cat.id * 100 + index, // Generate temporary IDs for fallback
      name: sub,
    })),
  }));

  const allCategories =
    apiCategories.length > 0 ? apiCategories : fallbackCategories;

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
                  ? cat.subcategorias.map((sub: any) => ({
                      id: sub.id,
                      name: sub.nombre,
                    }))
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

  // Fetch products when subcategory is selected
  useEffect(() => {
    const fetchProductsBySubcategory = async () => {
      if (!selectedSubcategoryId) {
        setProducts([]);
        return;
      }

      setLoadingProducts(true);
      try {
        const response = await request(
          `/stock/productos/ver/subcategoria/${selectedSubcategoryId}`,
          "GET",
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          // Mapear respuesta del API al formato Product
          // Cada producto del API puede tener múltiples variantes
          // Vamos a crear un Product por cada variante
          const mappedProducts: Product[] = [];

          response.data.forEach((producto: any) => {
            if (Array.isArray(producto.variantes) && producto.variantes.length > 0) {
              producto.variantes.forEach((variante: any, index: number) => {
                mappedProducts.push({
                  id: producto.id * 1000 + index, // ID único para cada variante
                  name: variante.nombre || `Producto ${producto.id}`,
                  price: variante.precio_publico || 0,
                  image: variante.foto,
                  description: `${variante.color || ""} - ${variante.medidas || ""}`.trim(),
                  variants: [
                    {
                      id: producto.id * 1000 + index,
                      name: variante.nombre || "",
                      price: variante.precio_publico || 0,
                      stock: variante.cantidad,
                      attributes: {
                        color: variante.color || "",
                        medidas: variante.medidas || "",
                        precio_contratista: variante.precio_contratista?.toString() || "",
                        cantidad: variante.cantidad?.toString() || "",
                      },
                    },
                  ],
                });
              });
            } else {
              // Si no hay variantes, crear un producto básico
              mappedProducts.push({
                id: producto.id,
                name: `Producto ${producto.id}`,
                price: 0,
              });
            }
          });

          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error cargando productos por subcategoría:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductsBySubcategory();
  }, [selectedSubcategoryId]);

  const filteredCategories = allCategories
    .map((category) => {
      const subcategories = category.subcategories ?? [];
      const matchesCategory = normalizedTerm
        ? category.name.toLowerCase().includes(normalizedTerm)
        : true;
      const matchingSubcategories = normalizedTerm
        ? subcategories.filter((subcategory) =>
            subcategory.name.toLowerCase().includes(normalizedTerm),
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
    .filter(Boolean) as Category[];

  const selectedCategoryData = selectedCategory
    ? allCategories.find((category) => category.id === selectedCategory)
    : null;

  const handleSubcategoryPress = (
    categoryId: number,
    subcategoryId: number,
    subcategoryName: string,
  ) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryName);
    setSelectedSubcategoryId(subcategoryId);
    setSearchTerm("");
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSubcategoryId(null);
    setProducts([]);
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
            products={products}
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
