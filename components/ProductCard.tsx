import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Pressable } from "react-native";
import { ShoppingBag, Star } from "lucide-react-native";
import type { Product } from "./constants";

interface ProductCardProps {
  product: Product;
  width: number;
  onPress?: (productId: number) => void;
}

export function ProductCard({ product, width, onPress }: ProductCardProps) {
  const onSale = product.oldPrice && product.oldPrice > product.price;

  return (
    <Pressable onPress={() => onPress?.(product.id)} className="mb-4">
      <Box
        className="bg-secondary-500 rounded-lg overflow-hidden border border-yellow-400"
        style={{ width }}
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
            <HStack space="xs">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color={i < Math.floor(product.rating) ? "#FFD700" : "#4B5563"}
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
}
