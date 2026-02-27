import { useState, useEffect, useCallback } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Dimensions, RefreshControl, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { categoryIcons, type Product } from "../../../components/constants";
import { request } from "@/constants/Request";
import { SearchHeader } from "@/components/SearchHeader";
import { CategoriesGrid } from "@/components/CategoriesGrid";
import { ProductsView } from "@/components/ProductsView";
import { usePermissions } from "@/contexts/PermissionsContext";

const { width: screenWidth } = Dimensions.get("window");

type Subcategory = {
  id: number;
  name: string;
  gananciaVentas: number;
  valorStock: number;
};

type Category = {
  id: number;
  name: string;
  icon: (typeof categoryIcons)[number];
  subcategories: Subcategory[];
};

export default function Inicio() {
  const router = useRouter();
  const { resetKey } = useLocalSearchParams<{ resetKey?: string }>();
  const { canCreate } = usePermissions();
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
  const [refreshing, setRefreshing] = useState(false);

  const normalizedTerm = searchTerm.trim().toLowerCase();

  const allCategories = apiCategories;

  const fetchCategories = useCallback(async () => {
    try {
      const response = await request("/stock/categorias/ver", "GET");

      if (response.status === 200) {
        // Manejar diferentes estructuras de respuesta
        // Estructura 1: response.data.categorias
        // Estructura 2: response.data.data (array directo)
        let categoriasArray: any[] = [];

        if (Array.isArray(response.data?.categorias)) {
          categoriasArray = response.data.categorias;
        } else if (Array.isArray(response.data?.data)) {
          categoriasArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          categoriasArray = response.data;
        }

        if (categoriasArray.length > 0) {
          // Mapear respuesta del backend al formato esperado por CategoriesGrid
          const mapped: Category[] = categoriasArray.map(
            (cat: any, index: number) => {
              const fallbackIcon =
                categoryIcons[index % categoryIcons.length] ?? categoryIcons[0];

              return {
                id: cat.id,
                name: cat.nombre,
                icon: fallbackIcon,
                subcategories: Array.isArray(cat.subcategorias)
                  ? cat.subcategorias.map((sub: any) => ({
                      id: sub.id,
                      name: sub.nombre,
                      gananciaVentas: sub.ganancias_ventas || 0,
                      valorStock: sub.valor_stock || 0,
                    }))
                  : [],
              };
            },
          );

          setApiCategories(mapped);
        } else {
          console.warn(
            "No se encontraron categorías en la respuesta:",
            response,
          );
        }
      } else {
        console.warn("Respuesta inesperada al cargar categorías:", response);
      }
    } catch (error) {
      console.error("Error cargando categorías:", error);
      // Mantener las categorías existentes en caso de error
    }
  }, []);

  // Ejecutar siempre que la pantalla reciba foco (al abrir la app o navegar a esta pantalla)
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories]),
  );

  // Fetch products when subcategory is selected
  const fetchProductsBySubcategory = async (subcategoryId: number | null) => {
    if (!subcategoryId) {
      setProducts([]);
      return;
    }

    setLoadingProducts(true);
    try {
      const response = await request(
        `/stock/productos/ver/subcategoria/${subcategoryId}`,
        "GET",
      );

      // La respuesta del servidor es: { message: "...", data: [...] }
      const productosData = response.data?.data || response.data;

      if (response.status === 200 && Array.isArray(productosData)) {
        // Mapear respuesta del API al formato Product
        // Cada producto del API puede tener múltiples variantes
        // Vamos a crear un Product por cada variante
        const mappedProducts: Product[] = [];

        productosData.forEach((producto: any) => {
          if (
            Array.isArray(producto.variantes) &&
            producto.variantes.length > 0
          ) {
            producto.variantes.forEach((variante: any, index: number) => {
              // La API nueva devuelve las fotos como un array: variante.fotos[]
              const firstPhotoUrl =
                Array.isArray(variante.fotos) && variante.fotos.length > 0
                  ? variante.fotos[0]?.url
                  : undefined;

              // Texto descriptivo corto para la card
              const shortDescription =
                `${variante.color || ""} - ${variante.medidas || ""}`.trim();

              mappedProducts.push({
                id: producto.id * 1000 + index, // ID único para cada variante (para la tarjeta)
                productId: producto.id, // ID real del producto para consultar detalles
                name: variante.nombre || `Producto ${producto.id}`,
                price: variante.precio_publico || 0,
                image: firstPhotoUrl,
                description: shortDescription,
                variants: [
                  {
                    id: producto.id * 1000 + index,
                    name: variante.nombre || "",
                    price: variante.precio_publico || 0,
                    stock: variante.cantidad,
                    attributes: {
                      // Campos básicos para mostrar info rápida
                      color: variante.color || "",
                      medidas: variante.medidas || "",
                      precio_contratista:
                        variante.precio_contratista?.toString() || "",
                      cantidad: variante.cantidad?.toString() || "",
                      ubicacion_nombre:
                        variante.ubicacion_almacen?.ubicacion?.nombre || "",
                      // Guardamos también la foto principal por consistencia
                      foto: firstPhotoUrl || "",
                    },
                  },
                ],
              });
            });
          } else {
            // Si no hay variantes, crear un producto básico
            mappedProducts.push({
              id: producto.id,
              productId: producto.id,
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

  useEffect(() => {
    fetchProductsBySubcategory(selectedSubcategoryId);
  }, [selectedSubcategoryId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    await fetchProductsBySubcategory(selectedSubcategoryId);
    setRefreshing(false);
  };

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
    const product = products.find((p) => p.id === productId);
    const realProductId = product?.productId || productId;
    router.push(`/tabs/(tabs)/producto/${realProductId}` as any);
  };

  const handleCreateProduct = () => {
    router.push("/tabs/(tabs)/producto/nuevo" as any);
  };

  useEffect(() => {
    if (!resetKey) {
      return;
    }

    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSubcategoryId(null);
    setProducts([]);
    setSearchTerm("");
  }, [resetKey]);

  return (
    <ImageBackground
      source={require("@/assets/images/madera.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#13E000"
          />
        }
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
              onCreatePress={canCreate ? handleCreateProduct : undefined}
              isLoading={loadingProducts}
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
    </ImageBackground>
  );
}
