import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ShoppingBag } from "lucide-react-native";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/components/constants";
import { Dimensions, Pressable } from "react-native";

interface ProductsViewProps {
  products: Product[];
  categoryName: string;
  screenWidth?: number;
  onProductPress?: (productId: number) => void;
  onCreatePress?: () => void;
}

const defaultScreenWidth = Dimensions.get("window").width;

export function ProductsView({
  products,
  categoryName,
  screenWidth = defaultScreenWidth,
  onProductPress,
  onCreatePress,
}: ProductsViewProps) {
  const productWidth = (screenWidth - 40) / 2 - 8;

  if (products.length === 0) {
    return (
      <Box className="pb-6">
        <Box className="mb-4">
          <HStack space="md" className="items-center justify-between">
            <Text className="text-white text-xl font-bold">{categoryName}</Text>
          </HStack>
          <HStack space="md" className="items-center justify-between">
            <Text className="text-gray-400 text-base mt-1">
              {products.length} productos disponibles
            </Text>
            <Pressable
              onPress={onCreatePress}
              className="bg-yellow-400 px-3 py-2 rounded-full"
            >
              <Text className="text-black text-sm font-semibold">
                Crear producto
              </Text>
            </Pressable>
          </HStack>
        </Box>
        <Center className="py-8">
          <Box className="items-center">
            <ShoppingBag size={42} color="#9CA3AF" strokeWidth={1.5} />
            <Text className="text-gray-400 text-center text-base mt-3 font-medium">
              Sin productos en esta categoría
            </Text>
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
      <Box className="mb-4">
        <HStack space="md" className="items-center justify-between">
          <Text className="text-white text-2xl font-bold">{categoryName}</Text>
        </HStack>

        <HStack space="md" className="items-center justify-between">
          <Text className="text-gray-400 text-base mt-1">
            {products.length} productos disponibles
          </Text>
          <Pressable
            onPress={onCreatePress}
            className="bg-yellow-400 px-3 py-2 rounded-full"
          >
            <Text className="text-black text-sm font-semibold">
              Crear producto
            </Text>
          </Pressable>
        </HStack>
      </Box>
      <Box>{rows}</Box>
    </Box>
  );
}
