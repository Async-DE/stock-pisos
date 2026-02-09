import { useLocalSearchParams } from "expo-router";
import { ProductDetailView } from "@/components/ProductDetailView";
import { getProductById } from "@/components/constants";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { ShoppingBag } from "lucide-react-native";
import { View } from "react-native";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : null;

  console.log("ProductDetailScreen - id:", id, "productId:", productId);

  if (!productId || isNaN(productId)) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <Center className="flex-1">
          <Box className="items-center">
            <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
            <Text className="text-gray-400 text-center text-base mt-3 font-medium">
              Producto no encontrado (ID inválido)
            </Text>
            <Text className="text-gray-500 text-center text-sm mt-2">
              ID recibido: {id}
            </Text>
          </Box>
        </Center>
      </View>
    );
  }

  const product = getProductById(productId);
  console.log("ProductDetailScreen - product:", product);

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <Center className="flex-1">
          <Box className="items-center">
            <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
            <Text className="text-gray-400 text-center text-base mt-3 font-medium">
              Producto no encontrado
            </Text>
            <Text className="text-gray-500 text-center text-sm mt-2">
              ID buscado: {productId}
            </Text>
          </Box>
        </Center>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <ProductDetailView product={product} />
    </View>
  );
}

