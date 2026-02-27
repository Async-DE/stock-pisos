import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Pressable, Image } from "react-native";
import { ShoppingBag } from "lucide-react-native";
import type { Product } from "./constants";

interface ProductCardProps {
  product: Product;
  width: number;
  onPress?: (productId: number) => void;
}

export function ProductCard({ product, width, onPress }: ProductCardProps) {
  const handlePress = () => {
    onPress?.(product.id);
  };

  const locationName =
    product.variants?.[0]?.attributes?.ubicacion_nombre || "Sin ubicación";
  const quantity = product.variants?.[0]?.attributes?.cantidad || "0";
  const publicPrice = Number(product.price || 0).toFixed(2);

  return (
    <Pressable onPress={handlePress} className="mb-4">
      <Box
        className="bg-secondary-500 rounded-xl overflow-hidden border border-[#169500] shadow-hard-2"
        style={{ width }}
      >
        {/* Imagen del producto */}
        <Box
          className="bg-secondary-600 justify-center items-center border-b border-[#169500] overflow-hidden"
          style={{ width: "100%", height: 160 }}
        >
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
              }}
            />
          ) : (
            <ShoppingBag size={48} color="#13E000" strokeWidth={1.5} />
          )}
        </Box>

        {/* Info del producto */}
        <Box className="p-3">
          <Text
            className="text-white font-semibold text-base leading-tight"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {product.name}
          </Text>

          <Box className="items-start mt-2">
            <VStack space="sm" className="justify-start mt-1">
              <Text className="text-[#169500] font-semibold text-base">
                {locationName}
              </Text>
              <Text className="text-gray-300 text-sm">
                Cantidad: {quantity}
              </Text>
              <Text className="text-gray-300 text-sm">
                Precio: ${publicPrice}
              </Text>
            </VStack>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}
