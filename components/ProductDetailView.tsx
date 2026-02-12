import { useState } from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Pressable, Image } from "react-native";
import { ShoppingBag, ArrowLeft, Package, Check } from "lucide-react-native";
import type { Product, ProductVariant } from "./constants";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Plus } from "lucide-react-native";

interface ProductDetailViewProps {
  product: Product;
  onAddVariant?: () => void;
}

export function ProductDetailView({
  product,
  onAddVariant,
}: ProductDetailViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Estado para la variante seleccionada (por defecto la primera)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null,
  );

  console.log("ProductDetailView - product:", product);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const renderVariantOption = (variant: ProductVariant) => {
    const isSelected = selectedVariant?.id === variant.id;
    const attributes = variant.attributes || {};
    const color = attributes.color || "";
    const medidas = attributes.medidas || "";

    return (
      <Pressable
        key={variant.id}
        onPress={() => setSelectedVariant(variant)}
        className="mb-3"
      >
        <Box
          className={`rounded-lg p-4 border-2 ${
            isSelected
              ? "bg-secondary-500 border-yellow-400"
              : "bg-secondary-600 border-yellow-400/50"
          }`}
        >
          <HStack space="md" className="justify-between items-center">
            <Box className="flex-1">
              <HStack space="sm" className="items-center mb-1">
                <Text className="text-white font-semibold text-base">
                  {variant.name}
                </Text>
                {isSelected && (
                  <Check size={20} color="#FFD700" strokeWidth={2} />
                )}
              </HStack>
              {(color || medidas) && (
                <Text className="text-gray-400 text-sm mb-2">
                  {[color, medidas].filter(Boolean).join(" • ")}
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
            <Package
              size={24}
              color={isSelected ? "#FFD700" : "#9CA3AF"}
              strokeWidth={1.5}
            />
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
          {/* Información de la categoría/subcategoría */}
          {product.description && (
            <Text className="text-gray-400 text-sm mb-3">
              {product.description}
            </Text>
          )}

          {/* Imagen de la variante seleccionada */}
          <Box
            className="bg-secondary-600 justify-center items-center rounded-lg border border-yellow-400 mb-4 overflow-hidden"
            style={{ width: "100%", height: 300 }}
          >
            {selectedVariant?.attributes?.foto ? (
              <Image
                source={{ uri: selectedVariant.attributes.foto }}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "cover",
                }}
              />
            ) : (
              <ShoppingBag size={80} color="#FFD700" strokeWidth={1.5} />
            )}
          </Box>

          {/* Información de la variante seleccionada */}
          {selectedVariant && (
            <Box className="mb-6">
              <Text className="text-white font-bold text-2xl mb-2">
                {selectedVariant.name}
              </Text>

              {/* Detalles de la variante */}
              <Box className="mb-4 space-y-2">
                {selectedVariant.attributes?.codigo && (
                  <HStack space="sm" className="items-center">
                    <Text className="text-gray-400 text-sm">Código:</Text>
                    <Text className="text-white text-sm font-medium">
                      {selectedVariant.attributes.codigo}
                    </Text>
                  </HStack>
                )}
                {selectedVariant.attributes?.color && (
                  <HStack space="sm" className="items-center">
                    <Text className="text-gray-400 text-sm">Color:</Text>
                    <Text className="text-white text-sm font-medium">
                      {selectedVariant.attributes.color}
                    </Text>
                  </HStack>
                )}
                {selectedVariant.attributes?.medidas && (
                  <HStack space="sm" className="items-center">
                    <Text className="text-gray-400 text-sm">Medidas:</Text>
                    <Text className="text-white text-sm font-medium">
                      {selectedVariant.attributes.medidas}
                    </Text>
                  </HStack>
                )}
                {selectedVariant.attributes?.descripcion && (
                  <HStack space="sm" className="items-center">
                    <Text className="text-gray-400 text-sm">Descripción:</Text>
                    <Text className="text-white text-sm font-medium">
                      {selectedVariant.attributes.descripcion}
                    </Text>
                  </HStack>
                )}
              </Box>

              {/* Precios */}
              <Box className="mb-4 p-4 bg-secondary-500/50 rounded-lg border border-yellow-400/30">
                <HStack space="sm" className="items-center mb-2">
                  <Text className="text-yellow-400 font-bold text-2xl">
                    {formatPrice(selectedVariant.price)}
                  </Text>
                  <Text className="text-gray-500 text-sm ml-2">
                    Precio público
                  </Text>
                </HStack>
                {selectedVariant.attributes?.precio_contratista && (
                  <HStack space="sm" className="items-center">
                    <Text className="text-gray-400 font-semibold text-lg">
                      {formatPrice(
                        parseFloat(
                          selectedVariant.attributes.precio_contratista,
                        ),
                      )}
                    </Text>
                    <Text className="text-gray-500 text-sm ml-2">
                      Precio contratista
                    </Text>
                  </HStack>
                )}
                {selectedVariant.stock !== undefined && (
                  <HStack space="sm" className="items-center mt-2">
                    <Text className="text-gray-400 text-sm">
                      Stock disponible:
                    </Text>
                    <Text className="text-white text-sm font-semibold">
                      {selectedVariant.stock} unidades
                    </Text>
                  </HStack>
                )}
              </Box>
            </Box>
          )}

          {/* Selector de variantes */}
          {product.variants && product.variants.length > 0 ? (
            <Box>
              <HStack space="md" className="items-center justify-between mb-3">
                <Box>
                  <Text className="text-white font-bold text-xl">
                    Seleccionar variante
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    {product.variants.length} variante
                    {product.variants.length !== 1 ? "s" : ""} disponible
                    {product.variants.length !== 1 ? "s" : ""}
                  </Text>
                </Box>
                {onAddVariant && (
                  <Button
                    size="md"
                    action="primary"
                    className="bg-[#FFD700] rounded-full px-4"
                    onPress={onAddVariant}
                  >
                    <ButtonIcon as={Plus} className="text-black" />
                    <ButtonText className="text-black font-semibold">
                      Agregar
                    </ButtonText>
                  </Button>
                )}
              </HStack>

              {product.variants.map(renderVariantOption)}
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
