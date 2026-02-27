import { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { SearchHeader } from "@/components/SearchHeader";
import { Center } from "@/components/ui/center";
import { ShoppingBag } from "lucide-react-native";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  View,
} from "react-native";
import { request } from "@/constants/Request";
import type { Product } from "@/components/constants";
import { ProductsView } from "@/components/ProductsView";
import { useRouter } from "expo-router";
import { BarcodeScannerModal } from "@/components/BarcodeScannerModal";

// Componente de fallback para errores
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#000000" }}>
      <Text className="text-white text-lg font-semibold mb-4">Error al cargar la búsqueda</Text>
      <Text className="text-gray-400 text-sm mb-4">{error?.message || "Error desconocido"}</Text>
      {resetErrorBoundary && (
        <Pressable
          onPress={resetErrorBoundary}
          className="bg-[#13E000] rounded-full py-3 px-6"
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}

function BuscarContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const trimmedTerm = searchTerm.trim();

  useEffect(() => {
    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Si no hay término de búsqueda, limpiar estado y salir
    if (!trimmedTerm) {
      setResults([]);
      setLoading(false);
      setError(null);
      return () => {
        isActive = false;
        if (timer) {
          clearTimeout(timer);
        }
      };
    }

    // Validar que trimmedTerm no esté vacío antes de continuar
    if (trimmedTerm.length === 0) {
      return () => {
        isActive = false;
      };
    }

    setLoading(true);
    setError(null);

    timer = setTimeout(async () => {
      try {
        // Validar que trimmedTerm aún existe y no está vacío
        if (!trimmedTerm || trimmedTerm.trim().length === 0) {
          if (isActive) {
            setLoading(false);
            setResults([]);
          }
          return;
        }

        const response = await request("/stock/productos/verbuscar", "POST", {
          search: trimmedTerm,
        });

        if (!isActive) {
          return;
        }

        // Validar que response existe
        if (!response || typeof response.status !== "number") {
          console.error("Respuesta inválida:", response);
          if (isActive) {
            setError("Error en la respuesta del servidor");
            setResults([]);
            setLoading(false);
          }
          return;
        }

        if (response.status === 200) {
          // Manejar diferentes estructuras de respuesta de forma segura
          let productosArray: any[] = [];
          
          try {
            if (Array.isArray(response.data?.data)) {
              productosArray = response.data.data;
            } else if (Array.isArray(response.data)) {
              productosArray = response.data;
            }
          } catch (parseError) {
            console.error("Error parseando respuesta:", parseError);
            if (isActive) {
              setError("Error procesando los resultados");
              setResults([]);
              setLoading(false);
            }
            return;
          }

          const mappedProducts: Product[] = [];

          productosArray.forEach((producto: any) => {
            try {
              // Validar que producto tiene id válido
              if (!producto || typeof producto.id !== "number") {
                console.warn("Producto sin ID válido:", producto);
                return;
              }

              const productId = producto.id;

              if (
                Array.isArray(producto.variantes) &&
                producto.variantes.length > 0
              ) {
                producto.variantes.forEach((variante: any, index: number) => {
                  try {
                    const variantId = productId * 1000 + index;
                    // Obtener la primera foto del array de fotos
                    const firstPhotoUrl =
                      Array.isArray(variante.fotos) && variante.fotos.length > 0
                        ? variante.fotos[0]?.url
                        : undefined;
                    
                    const shortDescription = (
                      `${variante?.color || ""} - ${variante?.medidas || ""}`
                    ).trim();

                    mappedProducts.push({
                      id: variantId,
                      productId: productId,
                      name: variante?.nombre || `Producto ${productId}`,
                      price: typeof variante?.precio_publico === "number"
                        ? variante.precio_publico
                        : 0,
                      image: firstPhotoUrl,
                      description: shortDescription || undefined,
                      variants: [
                        {
                          id: variantId,
                          name: variante?.nombre || "",
                          price: typeof variante?.precio_publico === "number"
                            ? variante.precio_publico
                            : 0,
                          stock: typeof variante?.cantidad === "number"
                            ? variante.cantidad
                            : 0,
                          attributes: {
                            color: variante?.color || "",
                            medidas: variante?.medidas || "",
                            precio_contratista:
                              variante?.precio_contratista != null
                                ? String(variante.precio_contratista)
                                : "",
                            cantidad:
                              variante?.cantidad != null
                                ? String(variante.cantidad)
                                : "",
                            foto: firstPhotoUrl || "",
                          },
                        },
                      ],
                    });
                  } catch (variantError) {
                    console.error("Error procesando variante:", variantError);
                  }
                });
              } else {
                // Producto sin variantes
                mappedProducts.push({
                  id: productId,
                  productId: productId,
                  name: `Producto ${productId}`,
                  price: 0,
                });
              }
            } catch (productError) {
              console.error("Error procesando producto:", productError);
            }
          });

          if (isActive) {
            setResults(mappedProducts);
          }
        } else {
          if (isActive) {
            setResults([]);
            if (response.status >= 400) {
              setError("Error en la búsqueda");
            }
          }
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
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [trimmedTerm]);

  const handleProductPress = (productId: number) => {
    try {
      const product = results.find((p) => p.id === productId);
      const realProductId = product?.productId || productId;
      router.push(`/tabs/(tabs)/producto/${realProductId}`);
    } catch (error) {
      console.error("Error navegando a producto:", error);
    }
  };

  // Intentar cargar la imagen de forma segura
  let backgroundImage;
  try {
    backgroundImage = require("@/assets/images/madera.jpg");
  } catch (error) {
    console.warn("Imagen de fondo no disponible:", error);
  }

  return (
    <ImageBackground
      source={backgroundImage || { uri: "" }}
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
              onScanPress={() => setIsScannerOpen(true)}
          />

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
      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={(code) => {
          // Usar el código escaneado como término de búsqueda
          setSearchTerm(code);
        }}
        title="Escanear código para buscar"
      />
    </ImageBackground>
  );
}

export default function Buscar() {
  try {
    return <BuscarContent />;
  } catch (error) {
    console.error("Error crítico en Buscar:", error);
    return <ErrorFallback error={error} />;
  }
}
