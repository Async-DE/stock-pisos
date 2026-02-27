import { useState, useRef } from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Pressable, Image, ImageBackground, Modal, Dimensions, FlatList, View as RNView } from "react-native";
import { ShoppingBag, ArrowLeft, Package, Check, ChevronDown, ChevronUp, X } from "lucide-react-native";
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
  
  // Resetear índice de imagen cuando cambia la variante
  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedImageIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollToIndex({ index: 0, animated: false });
    }
  };

  // Estado para mostrar/ocultar la sección de ganancias
  const [showGanancias, setShowGanancias] = useState(false);

  // Estado para mostrar la imagen en grande
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Referencias para el carrusel
  const carouselRef = useRef<FlatList>(null);
  const modalCarouselRef = useRef<FlatList>(null);
  
  // Obtener array de fotos de la variante seleccionada
  const getVariantPhotos = (variant: ProductVariant | null): string[] => {
    if (!variant?.attributes?.fotos) {
      // Si no hay fotos en formato array, usar foto individual
      return variant?.attributes?.foto ? [variant.attributes.foto] : [];
    }
    // Separar las fotos por coma si vienen como string
    const fotosString = variant.attributes.fotos;
    return fotosString.split(",").filter(Boolean);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const handleSell = () => {
    if (!selectedVariant) {
      return;
    }

    router.push({
      pathname: "/tabs/(tabs)/ventas/nuevo",
      params: {
        varianteId: String(selectedVariant.id),
        precioPublico: String(selectedVariant.price ?? 0),
        precioContratista: selectedVariant.attributes?.precio_contratista ?? "",
        nombreVariante: selectedVariant.name ?? "",
      },
    });
  };

  const renderVariantOption = (variant: ProductVariant) => {
    const isSelected = selectedVariant?.id === variant.id;
    const attributes = variant.attributes || {};
    const color = attributes.color || "";
    const medidas = attributes.medidas || "";

    return (
      <Pressable
        key={variant.id}
        onPress={() => handleVariantChange(variant)}
        className="mb-3"
      >
        <Box
          className={`rounded-lg p-4 border-2 ${
            isSelected
              ? "bg-secondary-500 border-[#169500]"
              : "bg-secondary-600 border-[#169500]/50"
          }`}
        >
          <HStack space="md" className="justify-between items-center">
            <Box className="flex-1">
              <HStack space="sm" className="items-center mb-1">
                <Text className="text-white font-semibold text-base">
                  {variant.name}
                </Text>
                {isSelected && (
                  <Check size={20} color="#13E000" strokeWidth={2} />
                )}
              </HStack>
              {(color || medidas) && (
                <Text className="text-gray-400 text-sm mb-2">
                  {[color, medidas].filter(Boolean).join(" • ")}
                </Text>
              )}
              <HStack space="sm" className="items-center">
                <Text className="text-[#169500] font-bold text-lg">
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
              color={isSelected ? "#13E000" : "#9CA3AF"}
              strokeWidth={1.5}
            />
          </HStack>
        </Box>
      </Pressable>
    );
  };

  if (!product) {
    return (
      <ImageBackground
        source={require("@/assets/images/madera.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Box className="flex-1 items-center justify-center">
          <Text className="text-white">Producto no disponible</Text>
        </Box>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/madera.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 80, // Espacio extra para el tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con botón de volver */}
        <Box
          className="px-4 pb-3 border-b border-[#169500]/0"
          style={{ paddingTop: Math.max(insets.top, 16) }}
        >
          <Pressable onPress={() => router.back()}>
            <HStack space="sm" className="items-center">
              <ArrowLeft size={24} color="#13E000" strokeWidth={2} />
              <Text className="text-[#169500] font-semibold text-base">
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

          {/* Carrusel de imágenes de la variante seleccionada */}
          {(() => {
            const photos = getVariantPhotos(selectedVariant);
            
            if (photos.length === 0) {
              return (
                <Box
                  className="bg-secondary-600 justify-center items-center rounded-lg border border-[#169500] mb-4 overflow-hidden"
                  style={{ width: "100%", height: 300 }}
                >
                  <ShoppingBag size={80} color="#13E000" strokeWidth={1.5} />
                </Box>
              );
            }
            
            const itemWidth = Dimensions.get("window").width - 32;
            
            return (
              <Box className="mb-4">
                <FlatList
                  ref={carouselRef}
                  data={photos}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => `photo-${index}`}
                  getItemLayout={(_, index) => ({
                    length: itemWidth,
                    offset: itemWidth * index,
                    index,
                  })}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(
                      event.nativeEvent.contentOffset.x / itemWidth
                    );
                    setSelectedImageIndex(index);
                  }}
                  renderItem={({ item, index }) => (
                    <Pressable
                      onPress={() => {
                        setSelectedImageIndex(index);
                        setShowImageModal(true);
                      }}
                      style={{ width: itemWidth }}
                    >
                      <Box
                        className="bg-secondary-600 justify-center items-center rounded-lg border border-[#169500] overflow-hidden"
                        style={{ width: "100%", height: 300 }}
                      >
                        <Image
                          source={{ uri: item }}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover",
                          }}
                        />
                      </Box>
                    </Pressable>
                  )}
                />
                
                {/* Indicadores de página */}
                {photos.length > 1 && (
                  <HStack space="xs" className="justify-center items-center mt-2">
                    {photos.map((_, index) => (
                      <Box
                        key={`indicator-${index}`}
                        className={`rounded-full ${
                          index === selectedImageIndex
                            ? "bg-[#13E000]"
                            : "bg-gray-500"
                        }`}
                        style={{
                          width: index === selectedImageIndex ? 8 : 6,
                          height: index === selectedImageIndex ? 8 : 6,
                        }}
                      />
                    ))}
                  </HStack>
                )}
              </Box>
            );
          })()}

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
              <Box className="mb-4 p-4 bg-secondary-500/50 rounded-lg border border-[#169500]/30">
                <HStack space="sm" className="items-center mb-2">
                  <Text className="text-[#169500] font-bold text-2xl">
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
                <HStack space="sm" className="items-center mt-4">
                  <Button
                    size="md"
                    action="primary"
                    className="bg-[#13E000] rounded-full px-4"
                    onPress={handleSell}
                  >
                    <ButtonIcon as={ShoppingBag} className="text-black" />
                    <ButtonText className="text-black font-semibold">
                      Vender
                    </ButtonText>
                  </Button>
                </HStack>
              </Box>

              {/* Ganancias - Sección colapsable */}
              <Box className="mb-4 bg-secondary-600 rounded-lg border border-[#13E000]/50 overflow-hidden">
                <Pressable onPress={() => setShowGanancias(!showGanancias)}>
                  <Box className="p-4">
                    <HStack space="sm" className="items-center justify-between">
                      <Text className="text-[#13E000] font-bold text-lg">
                        Ganancias
                      </Text>
                      {showGanancias ? (
                        <ChevronUp size={20} color="#13E000" />
                      ) : (
                        <ChevronDown size={20} color="#13E000" />
                      )}
                    </HStack>
                  </Box>
                </Pressable>
                {showGanancias && (
                  <Box className="px-4 pb-4 space-y-2">
                    <HStack space="sm" className="items-center justify-between">
                      <Text className="text-gray-400 text-sm">
                        Ganancia público:
                      </Text>
                      <Text className="text-white text-sm font-semibold">
                        {formatPrice(
                          parseFloat(
                            selectedVariant.attributes?.ganacia_publico || "0",
                          ),
                        )}
                      </Text>
                    </HStack>
                    <HStack space="sm" className="items-center justify-between">
                      <Text className="text-gray-400 text-sm">
                        Ganancia contratista:
                      </Text>
                      <Text className="text-white text-sm font-semibold">
                        {formatPrice(
                          parseFloat(
                            selectedVariant.attributes?.ganacia_contratista || "0",
                          ),
                        )}
                      </Text>
                    </HStack>
                    <HStack space="sm" className="items-center justify-between">
                      <Text className="text-gray-400 text-sm">
                        Ganancias stock:
                      </Text>
                      <Text className="text-[#13E000] text-sm font-bold">
                        {formatPrice(
                          parseFloat(
                            selectedVariant.attributes?.ganancias_stock || "0",
                          ),
                        )}
                      </Text>
                    </HStack>
                    <HStack space="sm" className="items-center justify-between">
                      <Text className="text-gray-400 text-sm">
                        Valor stock:
                      </Text>
                      <Text className="text-white text-sm font-semibold">
                        {formatPrice(
                          parseFloat(
                            selectedVariant.attributes?.valor_stock || "0",
                          ),
                        )}
                      </Text>
                    </HStack>
                  </Box>
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
                    className="bg-[#13E000] rounded-full px-4"
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
            <Box className="bg-secondary-500 rounded-lg p-6 border border-[#169500]">
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

      {/* Modal para imagen en grande con carrusel */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <Box
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Botón de cerrar */}
          <Pressable
            onPress={() => setShowImageModal(false)}
            style={{
              position: "absolute",
              top: Math.max(insets.top, 20),
              right: 20,
              zIndex: 10,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: 25,
              padding: 10,
            }}
          >
            <X size={24} color="#FFFFFF" strokeWidth={2} />
          </Pressable>

          {/* Carrusel de imágenes en grande */}
          {(() => {
            const photos = getVariantPhotos(selectedVariant);
            
            if (photos.length === 0) {
              return null;
            }
            
            return (
              <RNView style={{ flex: 1, width: "100%", justifyContent: "center" }}>
                <FlatList
                  ref={modalCarouselRef}
                  data={photos}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => `modal-photo-${index}`}
                  initialScrollIndex={selectedImageIndex}
                  getItemLayout={(_, index) => ({
                    length: Dimensions.get("window").width,
                    offset: Dimensions.get("window").width * index,
                    index,
                  })}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(
                      event.nativeEvent.contentOffset.x / Dimensions.get("window").width
                    );
                    setSelectedImageIndex(index);
                  }}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => setShowImageModal(false)}
                      style={{
                        width: Dimensions.get("window").width,
                        height: Dimensions.get("window").height,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={{ uri: item }}
                        style={{
                          width: Dimensions.get("window").width * 0.95,
                          height: Dimensions.get("window").height * 0.8,
                          resizeMode: "contain",
                        }}
                      />
                    </Pressable>
                  )}
                />
                
                {/* Indicadores de página en el modal */}
                {photos.length > 1 && (
                  <HStack 
                    space="xs" 
                    className="justify-center items-center"
                    style={{
                      position: "absolute",
                      bottom: Math.max(insets.bottom, 40),
                      alignSelf: "center",
                    }}
                  >
                    {photos.map((_, index) => (
                      <Box
                        key={`modal-indicator-${index}`}
                        className={`rounded-full ${
                          index === selectedImageIndex
                            ? "bg-[#13E000]"
                            : "bg-gray-500"
                        }`}
                        style={{
                          width: index === selectedImageIndex ? 10 : 8,
                          height: index === selectedImageIndex ? 10 : 8,
                        }}
                      />
                    ))}
                  </HStack>
                )}
              </RNView>
            );
          })()}
        </Box>
      </Modal>
    </ImageBackground>
  );
}
