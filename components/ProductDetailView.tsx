import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Pressable } from "react-native";
import { ShoppingBag, ArrowLeft, Package } from "lucide-react-native";
import type { Product, ProductVariant } from "./constants";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  console.log("ProductDetailView - product:", product);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const renderVariant = (variant: ProductVariant) => {
    const attributes = variant.attributes || {};
    const attributeText = Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    return (
      <Pressable key={variant.id} className="mb-3">
        <Box
          className="bg-secondary-500 rounded-lg p-4 border border-yellow-400"
        >
          <HStack space="md" className="justify-between items-center">
            <Box className="flex-1">
              <Text className="text-white font-semibold text-base mb-1">
                {variant.name}
              </Text>
              {attributeText && (
                <Text className="text-gray-400 text-sm mb-2">
                  {attributeText}
                </Text>
              )}
              <HStack space="sm" className="items-center">
                <Text className="text-yellow-400 font-bold text-lg">
                  {formatPrice(variant.price)}
                </Text>
                {variant.stock !== undefined && (
                  <Text className="text-gray-500 text-sm ml-2">
                    • Stock: {variant.stock}
                  </Text>
                )}
              </HStack>
            </Box>
            <Package size={24} color="#FFD700" strokeWidth={1.5} />
          </HStack>
        </Box>
      </Pressable>
    );
  };

  if (!product) {
    return (
      <Box className="flex-1 bg-[#000000] items-center justify-center">
        <Text className="text-white">Producto no disponible</Text>
      </Box>
    );
  }

  return (
    <Box style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 80, // Espacio extra para el tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con botón de volver */}
        <Box
          className="px-4 pb-3 bg-[#000000] border-b border-yellow-400/40"
          style={{ paddingTop: Math.max(insets.top, 16) }}
        >
          <Pressable onPress={() => router.back()}>
            <HStack space="sm" className="items-center">
              <ArrowLeft size={24} color="#FFD700" strokeWidth={2} />
              <Text className="text-yellow-400 font-semibold text-base">
                Volver
              </Text>
            </HStack>
          </Pressable>
        </Box>

        <Box className="px-4 pt-4">
        {/* Imagen del producto */}
        <Box
          className="bg-secondary-600 justify-center items-center rounded-lg border border-yellow-400 mb-4"
          style={{ width: "100%", height: 300 }}
        >
          <ShoppingBag size={80} color="#FFD700" strokeWidth={1.5} />
        </Box>

        {/* Información del producto */}
        <Box className="mb-6">
          <Text className="text-white font-bold text-2xl mb-2">
            {product.name}
          </Text>
          {product.description && (
            <Text className="text-gray-400 text-base mb-4 leading-6">
              {product.description}
            </Text>
          )}
          <HStack space="sm" className="items-center">
            <Text className="text-yellow-400 font-bold text-2xl">
              {formatPrice(product.price)}
            </Text>
            <Text className="text-gray-500 text-sm ml-2">
              Precio base
            </Text>
          </HStack>
        </Box>

        {/* Variantes del producto */}
        {product.variants && product.variants.length > 0 ? (
          <Box>
            <Text className="text-white font-bold text-xl mb-4">
              Variantes disponibles
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              {product.variants.length} variante{product.variants.length !== 1 ? "s" : ""} disponible{product.variants.length !== 1 ? "s" : ""}
            </Text>
            {product.variants.map(renderVariant)}
          </Box>
        ) : (
          <Box className="bg-secondary-500 rounded-lg p-6 border border-yellow-400">
            <Box className="items-center">
              <Package size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-400 text-center text-base mt-3 font-medium">
                No hay variantes disponibles para este producto
              </Text>
            </Box>
          </Box>
        )}
        </Box>
      </ScrollView>
    </Box>
  );
}

