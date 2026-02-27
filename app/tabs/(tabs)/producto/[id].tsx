import { useState, useEffect, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ProductDetailView } from "@/components/ProductDetailView";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { ShoppingBag } from "lucide-react-native";
import { View, ActivityIndicator } from "react-native";
import { request } from "@/constants/Request";
import type { Product } from "@/components/constants";
import { usePermissions } from "@/contexts/PermissionsContext";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { canCreate } = usePermissions();
  const productId = id ? parseInt(id, 10) : null;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId || isNaN(productId)) {
      setError("ID inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `/stock/productos/ver/${productId}`;

      console.log(
        `[${new Date().toLocaleTimeString()}] Consultando producto: ${productId}`,
      );

      const response = await request(url, "GET");

      console.log(
        `[${new Date().toLocaleTimeString()}] Respuesta recibida para producto ${productId}`,
      );

      // La respuesta del servidor es: { message: "...", data: {...} }
      const productoData = response.data?.data || response.data;

      if (response.status === 200 && productoData) {
        // Mapear respuesta del API al formato Product
        const mappedProduct: Product = {
          id: productoData.id,
          productId: productoData.id,
          name:
            productoData.subcategoria?.nombre || `Producto ${productoData.id}`,
          price: 0, // Se establecerá desde la variante seleccionada
          description:
            `${productoData.subcategoria?.categoria?.nombre || ""} / ${productoData.subcategoria?.nombre || ""}`.trim(),
          variants: Array.isArray(productoData.variantes)
            ? productoData.variantes.map((variante: any) => {
                // Extraer datos anidados de ubicación desde ubicacion_almacen
                const ubicacionAlmacen = variante.ubicacion_almacen;
                const ubicacion = ubicacionAlmacen?.ubicacion;

                // Extraer array de fotos
                const fotos = Array.isArray(variante.fotos)
                  ? variante.fotos
                      .map((foto: any) => foto?.url || "")
                      .filter(Boolean)
                  : [];
                const primeraFoto = fotos.length > 0 ? fotos[0] : "";

                return {
                  id: variante.id,
                  name: variante.nombre || "",
                  price: variante.precio_publico || 0,
                  stock: variante.cantidad,
                  attributes: {
                    foto: primeraFoto, // Primera foto para compatibilidad
                    fotos: fotos.join(","), // Todas las fotos separadas por coma
                    codigo: variante.codigo || "",
                    color: variante.color || "",
                    descripcion: variante.descripcion || "",
                    medidas: variante.medidas || "",
                    precio_publico: variante.precio_publico?.toString() || "",
                    precio_contratista:
                      variante.precio_contratista?.toString() || "",
                    costo_compra: variante.costo_compra?.toString() || "",
                    cantidad: variante.cantidad?.toString() || "",
                    ganacia_publico:
                      variante.ganacia_publico?.toString() || "0",
                    ganacia_contratista:
                      variante.ganacia_contratista?.toString() || "0",
                    ganancias_stock:
                      variante.ganancias_stock?.toString() || "0",
                    valor_stock: variante.valor_stock?.toString() || "0",
                    // Datos de ubicación anidados
                    ubicacion_id: ubicacion?.id?.toString() || "",
                    ubicacion_nombre: ubicacion?.nombre || "",
                    ubicacion_calle: ubicacion?.calle || "",
                    ubicacion_cp: ubicacion?.cp || "",
                    ubicacion_colonia: ubicacion?.colonia || "",
                    ubicacion_celular: ubicacion?.celular || "",
                    // Datos de almacén/estante
                    almacen_id: ubicacionAlmacen?.id?.toString() || "",
                    almacen_codigo: ubicacionAlmacen?.codigo || "",
                    almacen_tipo: ubicacionAlmacen?.tipo || "",
                    almacen_descripcion: ubicacionAlmacen?.descripcion || "",
                  },
                };
              })
            : [],
        };

        // Si hay variantes, establecer la primera como predeterminada
        if (mappedProduct.variants && mappedProduct.variants.length > 0) {
          const firstVariant = mappedProduct.variants[0];
          mappedProduct.price = firstVariant.price;
          mappedProduct.image = firstVariant.attributes?.foto;
        }

        console.log(
          `[${new Date().toLocaleTimeString()}] Producto mapeado con ${mappedProduct.variants?.length || 0} variantes`,
        );
        setProduct(mappedProduct);
      } else {
        setError("Producto no encontrado");
      }
    } catch (err) {
      console.error(
        `[${new Date().toLocaleTimeString()}] Error cargando producto:`,
        err,
      );
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Consultar cuando la pantalla se enfoca (usuario vuelve a esta pantalla)
  useFocusEffect(
    useCallback(() => {
      if (productId && !isNaN(productId)) {
        console.log(
          `[${new Date().toLocaleTimeString()}] Pantalla enfocada, consultando producto en tiempo real...`,
        );
        // Pequeño delay para asegurar que la pantalla esté lista
        const timer = setTimeout(() => {
          fetchProduct();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [productId, fetchProduct]),
  );

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
          <ActivityIndicator size="large" color="#13E000" />
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
        onAddVariant={
          canCreate
            ? () =>
                router.push(`/tabs/(tabs)/producto/${productId}/variante/nuevo`)
            : undefined
        }
        onEditVariant={
          canCreate
            ? (variantId) =>
                router.push(
                  `/tabs/(tabs)/producto/${productId}/variante/${variantId}/editar`,
                )
            : undefined
        }
      />
    </View>
  );
}
