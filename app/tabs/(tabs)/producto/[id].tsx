import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ProductDetailView } from "@/components/ProductDetailView";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { ShoppingBag } from "lucide-react-native";
import { View, ActivityIndicator } from "react-native";
import { request } from "@/constants/Request";
import type { Product } from "@/components/constants";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const productId = id ? parseInt(id, 10) : null;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || isNaN(productId)) {
        setError("ID inválido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await request(
          `/stock/productos/ver/${productId}`,
          "GET",
        );

        if (response.status === 200 && response.data) {
          const productoData = response.data;

          // Mapear respuesta del API al formato Product
          const mappedProduct: Product = {
            id: productoData.id,
            name: productoData.subcategoria?.nombre || `Producto ${productoData.id}`,
            price: 0, // Se establecerá desde la variante seleccionada
            description: `${productoData.subcategoria?.categoria?.nombre || ""} / ${productoData.subcategoria?.nombre || ""}`.trim(),
            variants: Array.isArray(productoData.variantes)
              ? productoData.variantes.map((variante: any) => ({
                  id: variante.id,
                  name: variante.nombre || "",
                  price: variante.precio_publico || 0,
                  stock: variante.cantidad,
                  attributes: {
                    foto: variante.foto || "",
                    codigo: variante.codigo || "",
                    color: variante.color || "",
                    descripcion: variante.descripcion || "",
                    medidas: variante.medidas || "",
                    precio_publico: variante.precio_publico?.toString() || "",
                    precio_contratista: variante.precio_contratista?.toString() || "",
                    costo_compra: variante.costo_compra?.toString() || "",
                    cantidad: variante.cantidad?.toString() || "",
                    ubicacion_id: variante.ubicacion_id?.toString() || "",
                    estante_id: variante.estante_id?.toString() || "",
                  },
                }))
              : [],
          };

          // Si hay variantes, establecer la primera como predeterminada
          if (mappedProduct.variants && mappedProduct.variants.length > 0) {
            const firstVariant = mappedProduct.variants[0];
            mappedProduct.price = firstVariant.price;
            mappedProduct.image = firstVariant.attributes?.foto;
          }

          setProduct(mappedProduct);
        } else {
          setError("Producto no encontrado");
        }
      } catch (err) {
        console.error("Error cargando producto:", err);
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <Center className="flex-1">
          <ActivityIndicator size="large" color="#FFD700" />
          <Text className="text-gray-400 text-center text-base mt-3">
            Cargando producto...
          </Text>
        </Center>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <Center className="flex-1">
          <Box className="items-center">
            <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
            <Text className="text-gray-400 text-center text-base mt-3 font-medium">
              {error || "Producto no encontrado"}
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
      <ProductDetailView
        product={product}
        onAddVariant={() =>
          router.push(`/tabs/(tabs)/producto/${productId}/variante/nuevo`)
        }
      />
    </View>
  );
}

