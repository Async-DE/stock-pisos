import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ShoppingBag } from "lucide-react-native";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/components/constants";
import { ActivityIndicator, Dimensions, Pressable } from "react-native";

interface ProductsViewProps {
  products: Product[];
  categoryName: string;
  screenWidth?: number;
  onProductPress?: (productId: number) => void;
  onCreatePress?: () => void;
  isLoading?: boolean;
}

const defaultScreenWidth = Dimensions.get("window").width;

export function ProductsView({
  products,
  categoryName,
  screenWidth = defaultScreenWidth,
  onProductPress,
  onCreatePress,
  isLoading = false,
}: ProductsViewProps) {
  const productWidth = (screenWidth - 40) / 2 - 8;

  const Header = (
    <Box className="mb-4">
      <HStack space="md" className="items-center justify-between">
        <Box className="flex-1">
          <Text className="text-white text-2xl font-bold" numberOfLines={1}>
            {categoryName}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            {products.length} producto{products.length !== 1 ? "s" : ""}{" "}
            disponible
            {products.length !== 1 ? "s" : ""}
          </Text>
        </Box>
        {onCreatePress && (
          <Pressable
            onPress={onCreatePress}
            className="bg-[#169500] px-4 py-2 rounded-full"
          >
            <Text className="text-black text-sm font-semibold">Crear</Text>
          </Pressable>
        )}
      </HStack>
    </Box>
  );

  if (isLoading) {
    return (
      <Box className="pb-6">
        {Header}
        <Center className="py-10">
          <ActivityIndicator size="large" color="#13E000" />
          <Text className="text-gray-400 text-center text-base mt-3">
            Cargando productos...
          </Text>
        </Center>
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box className="pb-6">
        {Header}
        <Center className="py-8">
          <Box className="items-center">
            <ShoppingBag size={42} color="#9CA3AF" strokeWidth={1.5} />
            <Text className="text-gray-400 text-center text-base mt-3 font-medium">
              Sin productos en esta categoría
            </Text>
            {onCreatePress && (
              <Pressable
                onPress={onCreatePress}
                className="bg-[#169500] px-4 py-2 rounded-full mt-4"
              >
                <Text className="text-black text-sm font-semibold">
                  Crear producto
                </Text>
              </Pressable>
            )}
          </Box>
        </Center>
      </Box>
    );
  }

  const rows = [];
  for (let i = 0; i < products.length; i += 2) {
    const rowProducts = products.slice(i, i + 2);
    rows.push(
      <HStack
        key={`row-${i}`}
        space="md"
        reversed={false}
        className="justify-between mb-2"
      >
        {rowProducts.map((product) => (
          <Box key={product.id} style={{ width: productWidth }}>
            <ProductCard
              product={product}
              width={productWidth}
              onPress={onProductPress}
            />
          </Box>
        ))}
        {rowProducts.length === 1 && <Box style={{ width: productWidth }} />}
      </HStack>,
    );
  }

  return (
    <Box className="pb-6">
      {Header}
      <Box>{rows}</Box>
    </Box>
  );
}
