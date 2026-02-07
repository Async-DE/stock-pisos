import { useState } from "react";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Dimensions, Pressable } from "react-native";
import {
  Search,
  ShoppingBag,
  Smartphone,
  Shirt,
  Apple,
  Wrench,
  Sofa,
  Gamepad2,
  BookOpen,
  Dumbbell,
  Home,
  Heart,
  Sparkles,
  Car,
  PawPrint,
  Book,
  Music,
  Plane,
  Leaf,
  Headphones,
  Zap,
  ArrowLeft,
  Star,
} from "lucide-react-native";

import { Input, InputField } from "@/components/ui/input";

// Obtener dimensiones de la pantalla
const { width: screenWidth } = Dimensions.get("window");

// Datos de ejemplo para las categorías con iconos específicos
const categories = [
  { id: 1, name: "Productos", icon: ShoppingBag },
  { id: 2, name: "Tecnología", icon: Smartphone },
  { id: 3, name: "Moda", icon: Shirt },
  { id: 4, name: "Supermercado", icon: Apple },
  { id: 5, name: "Ferretería", icon: Wrench },
  { id: 6, name: "Hogar", icon: Sofa },
  { id: 7, name: "Entretenimiento", icon: Gamepad2 },
  { id: 8, name: "Educación", icon: BookOpen },
  { id: 9, name: "Deportes", icon: Dumbbell },
  { id: 10, name: "Salud y Bienestar", icon: Heart },
  { id: 11, name: "Belleza", icon: Sparkles },
  { id: 12, name: "Automóviles", icon: Car },
  { id: 13, name: "Mascotas", icon: PawPrint },
  { id: 14, name: "Libros", icon: Book },
  { id: 15, name: "Música", icon: Music },
  { id: 16, name: "Viajes", icon: Plane },
  { id: 17, name: "Jardín", icon: Leaf },
  { id: 18, name: "Accesorios", icon: Headphones },
  { id: 19, name: "Utilidades", icon: Zap },
];

// Mockup de productos para cada categoría
const productsByCategory: Record<
  number,
  Array<{
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviews: number;
    image?: string;
  }>
> = {
  1: [
    {
      id: 1,
      name: "Producto Premium 1",
      price: 1500,
      oldPrice: 2000,
      rating: 4.8,
      reviews: 245,
    },
    {
      id: 2,
      name: "Producto Premium 2",
      price: 1200,
      oldPrice: 1800,
      rating: 4.6,
      reviews: 189,
    },
    {
      id: 3,
      name: "Producto Premium 3",
      price: 2500,
      rating: 4.9,
      reviews: 412,
    },
    {
      id: 4,
      name: "Producto Premium 4",
      price: 890,
      oldPrice: 1200,
      rating: 4.5,
      reviews: 156,
    },
    {
      id: 5,
      name: "Producto Premium 5",
      price: 3200,
      rating: 4.7,
      reviews: 328,
    },
    {
      id: 6,
      name: "Producto Premium 6",
      price: 1650,
      oldPrice: 2200,
      rating: 4.4,
      reviews: 112,
    },
  ],
  2: [
    {
      id: 7,
      name: "Laptop i5",
      price: 45000,
      oldPrice: 55000,
      rating: 4.9,
      reviews: 523,
    },
    { id: 8, name: "Mouse Inalámbrico", price: 850, rating: 4.7, reviews: 298 },
    {
      id: 9,
      name: "Teclado Mecánico",
      price: 3200,
      oldPrice: 4000,
      rating: 4.8,
      reviews: 412,
    },
    { id: 10, name: "Monitor 27 4K", price: 8500, rating: 4.6, reviews: 187 },
    {
      id: 11,
      name: "Auriculares Bluetooth",
      price: 2500,
      oldPrice: 3500,
      rating: 4.8,
      reviews: 645,
    },
    { id: 12, name: "Webcam HD", price: 1200, rating: 4.5, reviews: 234 },
  ],
  3: [
    {
      id: 13,
      name: "Camiseta Premium",
      price: 350,
      oldPrice: 500,
      rating: 4.7,
      reviews: 345,
    },
    {
      id: 14,
      name: "Pantalón Casual",
      price: 650,
      oldPrice: 900,
      rating: 4.6,
      reviews: 267,
    },
    {
      id: 15,
      name: "Chaqueta de Invierno",
      price: 2800,
      oldPrice: 3500,
      rating: 4.8,
      reviews: 423,
    },
    {
      id: 16,
      name: "Zapatillas Deportivas",
      price: 1500,
      oldPrice: 2000,
      rating: 4.9,
      reviews: 834,
    },
    {
      id: 17,
      name: "Accesorios de Moda",
      price: 450,
      rating: 4.5,
      reviews: 156,
    },
    { id: 18, name: "Gorro Térmico", price: 280, rating: 4.4, reviews: 98 },
  ],
  4: [
    {
      id: 19,
      name: "Leche Integral 1L",
      price: 120,
      rating: 4.8,
      reviews: 567,
    },
    { id: 20, name: "Pan Integral", price: 280, rating: 4.6, reviews: 234 },
    { id: 21, name: "Almendras 500g", price: 650, rating: 4.9, reviews: 345 },
    { id: 22, name: "Aceite de Oliva", price: 890, rating: 4.7, reviews: 289 },
    { id: 23, name: "Huevos Doena", price: 450, rating: 4.8, reviews: 412 },
    {
      id: 24,
      name: "Café Gourmet 250g",
      price: 520,
      rating: 4.6,
      reviews: 198,
    },
  ],
  5: [
    {
      id: 25,
      name: "Taladro Percutor",
      price: 3500,
      oldPrice: 4500,
      rating: 4.8,
      reviews: 278,
    },
    { id: 26, name: "Martillo de Goma", price: 450, rating: 4.7, reviews: 145 },
    {
      id: 27,
      name: "Juego de Destornilladores",
      price: 650,
      rating: 4.9,
      reviews: 356,
    },
    {
      id: 28,
      name: "Sierra Circular",
      price: 5200,
      oldPrice: 6500,
      rating: 4.6,
      reviews: 234,
    },
    { id: 29, name: "Cinta Métrica 5m", price: 280, rating: 4.5, reviews: 89 },
    { id: 30, name: "Nivel Láser", price: 2800, rating: 4.7, reviews: 167 },
  ],
  6: [
    {
      id: 31,
      name: "Sofá 3 Cuerpos",
      price: 12500,
      oldPrice: 15000,
      rating: 4.9,
      reviews: 423,
    },
    { id: 32, name: "Mesa de Centro", price: 2200, rating: 4.7, reviews: 198 },
    { id: 33, name: "Lámpara de Pie", price: 1500, rating: 4.6, reviews: 267 },
    {
      id: 34,
      name: "Cortinas Premium",
      price: 3500,
      oldPrice: 4500,
      rating: 4.8,
      reviews: 312,
    },
    { id: 35, name: "Almohadas Set 2", price: 890, rating: 4.7, reviews: 156 },
    { id: 36, name: "Tapete 2x3m", price: 2800, rating: 4.5, reviews: 234 },
  ],
};

// Función para obtener los productos de una categoría
const getProductsForCategory = (categoryId: number) => {
  return productsByCategory[categoryId] || [];
};

export default function Inicio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Calcular tamaño de los items basado en el ancho de la pantalla
  const itemSize = Math.min((screenWidth - 40) / 3, 100); // Más compacto: 100px máximo
  const iconBoxSize = itemSize * 0.7; // Reducido a 70%

  // Filtrar categorías basado en la búsqueda
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Obtener productos de la categoría seleccionada
  const selectedCategoryData = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;
  const productsInCategory = selectedCategory
    ? getProductsForCategory(selectedCategory)
    : [];

  // Función para renderizar producto individual
  const renderProductItem = (product: (typeof productsInCategory)[0]) => {
    const productWidth = (screenWidth - 40) / 2 - 8; // Dos productos por fila
    const onSale = product.oldPrice && product.oldPrice > product.price;

    return (
      <Pressable
        key={product.id}
        onPress={() => {
          // Aquí puede ir la lógica para ver detalles del producto
        }}
        className="mb-4"
      >
        <Box
          className="bg-secondary-500 rounded-lg overflow-hidden border border-yellow-400"
          style={{ width: productWidth }}
        >
          {/* Imagen placeholder */}
          <Box
            className="bg-secondary-600 justify-center items-center border-b border-yellow-400"
            style={{ width: "100%", height: 160 }}
          >
            <ShoppingBag size={48} color="#FFD700" strokeWidth={1.5} />
          </Box>

          {/* Info del producto */}
          <Box className="p-3">
            <Text
              className="text-white font-semibold text-sm leading-tight"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {product.name}
            </Text>

            {/* Precios */}
            <Box className="items-start mt-2">
              <HStack space="sm" className="items-center">
                <Text className="text-yellow-400 font-bold text-lg">
                  ${product.price.toLocaleString()}
                </Text>
                {onSale && (
                  <Text className="text-gray-400 line-through text-xs">
                    ${product.oldPrice?.toLocaleString()}
                  </Text>
                )}
              </HStack>
              {onSale && (
                <Text className="text-red-400 text-xs font-bold mt-1">
                  Oferta
                </Text>
              )}
            </Box>

            {/* Rating */}
            <HStack space="xs" className="items-center mt-2">
              <HStack>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    color={
                      i < Math.floor(product.rating) ? "#FFD700" : "#4B5563"
                    }
                    fill={i < Math.floor(product.rating) ? "#FFD700" : "none"}
                    strokeWidth={1.5}
                  />
                ))}
              </HStack>
              <Text className="text-gray-400 text-xs">({product.reviews})</Text>
            </HStack>
          </Box>
        </Box>
      </Pressable>
    );
  };

  // Función para renderizar el grid de productos
  const renderProductsView = () => {
    // Agrupar productos en filas de 2
    const rows = [];
    for (let i = 0; i < productsInCategory.length; i += 2) {
      const rowProducts = productsInCategory.slice(i, i + 2);
      rows.push(
        <HStack
          key={`row-${i}`}
          space="md"
          reversed={false}
          className="justify-between mb-2"
        >
          {rowProducts.map((product) => (
            <Box key={product.id} style={{ width: (screenWidth - 40) / 2 - 8 }}>
              {renderProductItem(product)}
            </Box>
          ))}
          {rowProducts.length === 1 && (
            <Box style={{ width: (screenWidth - 40) / 2 - 8 }} />
          )}
        </HStack>,
      );
    }
    return rows;
  };

  // Función para renderizar las categorías en grid
  const renderCategoriesGrid = (categoriesList: typeof categories) => {
    const rows = [];

    for (let i = 0; i < categoriesList.length; i += 3) {
      const rowCategories = categoriesList.slice(i, i + 3);
      rows.push(
        <HStack
          key={`row-${i}`}
          space="sm" // Reducido a 'sm' para más compacto
          reversed={false}
          className="mt-3 justify-between"
        >
          {rowCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Box className="items-center" style={{ width: itemSize }}>
                  <Box
                    className="bg-secondary-500 rounded-lg justify-center items-center border-2 border-yellow-400"
                    style={{
                      width: iconBoxSize,
                      height: iconBoxSize,
                      minHeight: 65,
                      minWidth: 65,
                    }}
                  >
                    <IconComponent
                      size={iconBoxSize * 0.45} // Reducido a 45%
                      color="#fff112"
                      strokeWidth={2}
                    />
                  </Box>
                  <Text
                    className="text-white text-center mt-1.5 font-medium text-sm leading-tight"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={{
                      fontSize: screenWidth < 375 ? 12 : 14, // Texto más pequeño en pantallas angostas
                      minHeight: 36, // Altura mínima para evitar que se corte
                      paddingHorizontal: 2, // Pequeño padding horizontal
                    }}
                  >
                    {category.name}
                  </Text>
                </Box>
              </Pressable>
            );
          })}
        </HStack>,
      );
    }

    return rows;
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
        {/* Logo de la compañía - Más compacto */}
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

        {/* Barra de búsqueda - Más compacta */}
        <Box className="mb-5">
          <HStack
            space="sm"
            reversed={false}
            className="items-center bg-secondary-400 py-2.5 px-3 rounded-lg border-2 border-yellow-400"
          >
            {selectedCategory && (
              <Pressable onPress={() => setSelectedCategory(null)}>
                <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
              </Pressable>
            )}
            {!selectedCategory && (
              <Search size={22} color="#FFFFFF" strokeWidth={2} />
            )}
            <Input
              variant="outline"
              size="sm" // Cambiado a 'sm' para más compacto
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
              className="flex-1 border-0"
            >
              <InputField
                placeholder={
                  selectedCategory
                    ? `Buscar en ${selectedCategoryData?.name}...`
                    : "Buscar..."
                }
                value={searchTerm}
                onChangeText={setSearchTerm}
                className="text-sm placeholder:text-gray-300"
                placeholderTextColor="#9CA3AF"
              />
            </Input>
          </HStack>
        </Box>

        {/* Vista de Productos */}
        {selectedCategory ? (
          <Box className="pb-6">
            {/* Título de la categoría */}
            <Box className="mb-4">
              <Text className="text-white text-xl font-bold">
                {selectedCategoryData?.name}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                {productsInCategory.length} productos disponibles
              </Text>
            </Box>

            {/* Grid de productos */}
            {productsInCategory.length === 0 ? (
              <Center className="py-8">
                <Box className="items-center">
                  <ShoppingBag size={42} color="#9CA3AF" strokeWidth={1.5} />
                  <Text className="text-gray-400 text-center text-base mt-3 font-medium">
                    Sin productos en esta categoría
                  </Text>
                </Box>
              </Center>
            ) : (
              <Box>{renderProductsView()}</Box>
            )}
          </Box>
        ) : (
          // Vista de Categorías
          <Box className="pb-6">
            {filteredCategories.length === 0 ? (
              <Center className="py-8">
                <Box className="items-center">
                  <Search size={42} color="#9CA3AF" strokeWidth={1.5} />
                  <Text className="text-gray-400 text-center text-base mt-3 font-medium">
                    No encontramos esa categoría
                  </Text>
                  <Text className="text-gray-500 text-center text-xs mt-1">
                    Intenta con otro nombre
                  </Text>
                </Box>
              </Center>
            ) : (
              <Box>{renderCategoriesGrid(filteredCategories)}</Box>
            )}
          </Box>
        )}
      </Box>
    </ScrollView>
  );
}
