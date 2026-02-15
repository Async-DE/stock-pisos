import { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { SearchHeader } from "@/components/SearchHeader";
import { Center } from "@/components/ui/center";
import { ShoppingBag, ScanLine } from "lucide-react-native";
import { ActivityIndicator, ImageBackground, Pressable } from "react-native";
import { request } from "@/constants/Request";
import type { Product } from "@/components/constants";
import { ProductsView } from "@/components/ProductsView";
import { useRouter } from "expo-router";
import { BarcodeScanner } from "@/components/BarcodeScanner";

export default function Buscar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  const trimmedTerm = searchTerm.trim();

  useEffect(() => {
    let isActive = true;

    if (!trimmedTerm) {
      setResults([]);
      setLoading(false);
      setError(null);
      return () => {
        isActive = false;
      };
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await request("/stock/productos/verbuscar", "POST", {
          search: trimmedTerm,
        });

        if (!isActive) {
          return;
        }

        if (response.status === 200) {
          const productosArray = Array.isArray(response.data?.data)
            ? response.data.data
            : Array.isArray(response.data)
            ? response.data
            : [];

          const mappedProducts: Product[] = [];

          productosArray.forEach((producto: any) => {
            if (
              Array.isArray(producto.variantes) &&
              producto.variantes.length > 0
            ) {
              producto.variantes.forEach((variante: any, index: number) => {
                mappedProducts.push({
                  id: producto.id * 1000 + index,
                  productId: producto.id,
                  name: variante.nombre || `Producto ${producto.id}`,
                  price: variante.precio_publico || 0,
                  image: variante.foto,
                  description: `${variante.color || ""} - ${
                    variante.medidas || ""
                  }`.trim(),
                  variants: [
                    {
                      id: producto.id * 1000 + index,
                      name: variante.nombre || "",
                      price: variante.precio_publico || 0,
                      stock: variante.cantidad,
                      attributes: {
                        color: variante.color || "",
                        medidas: variante.medidas || "",
                        precio_contratista:
                          variante.precio_contratista?.toString() || "",
                        cantidad: variante.cantidad?.toString() || "",
                        foto: variante.foto || "",
                      },
                    },
                  ],
                });
              });
            } else {
              mappedProducts.push({
                id: producto.id,
                productId: producto.id,
                name: `Producto ${producto.id}`,
                price: 0,
              });
            }
          });

          setResults(mappedProducts);
        } else {
          setResults([]);
        }
      } catch (err) {
        if (!isActive) {
          return;
        }
        console.error("Error en búsqueda de productos:", err);
        setError("No se pudo cargar la búsqueda");
        setResults([]);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [trimmedTerm]);

  const handleProductPress = (productId: number) => {
    const product = results.find((p) => p.id === productId);
    const realProductId = product?.productId || productId;
    router.push(`/tabs/(tabs)/producto/${realProductId}`);
  };

  const handleBarcodeScan = (barcode: string) => {
    setSearchTerm(barcode);
    setScannerVisible(false);
  };

  return (
    <ImageBackground
      source={require("@/assets/images/madera.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 16,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="flex-1 px-3">
        {/* Header con búsqueda */}
        <SearchHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={null}
          onBack={() => {}}
        />

        {/* Botón de escáner */}
        <Pressable
          onPress={() => setScannerVisible(true)}
          className="bg-[#13E000] rounded-full py-3 px-6 mb-4 flex-row items-center justify-center"
        >
          <ScanLine size={20} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-white font-semibold ml-2 text-base">
            Escanear código de barras
          </Text>
        </Pressable>

        {/* Contenido: Resultados o mensajes */}
        {!trimmedTerm ? (
          <Center className="py-12">
            <Box className="items-center">
              <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-400 text-center text-base mt-4 font-medium">
                Escribe para buscar productos
              </Text>
            </Box>
          </Center>
        ) : loading ? (
          <Center className="py-12">
            <ActivityIndicator size="large" color="#13E000" />
            <Text className="text-gray-400 text-center text-base mt-4 font-medium">
              Buscando productos...
            </Text>
          </Center>
        ) : error ? (
          <Center className="py-12">
            <Box className="items-center">
              <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-400 text-center text-base mt-4 font-medium">
                {error}
              </Text>
            </Box>
          </Center>
        ) : results.length === 0 ? (
          <Center className="py-12">
            <Box className="items-center">
              <ShoppingBag size={48} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-400 text-center text-base mt-4 font-medium">
                Sin resultados para "{trimmedTerm}"
              </Text>
            </Box>
          </Center>
        ) : (
          <ProductsView
            products={results}
            onProductPress={handleProductPress}
            categoryName={`Resultados para "${trimmedTerm}"`}
          />
        )}
        </Box>
      </ScrollView>

      {/* Escáner de códigos de barras */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
      />
    </ImageBackground>
  );
}
