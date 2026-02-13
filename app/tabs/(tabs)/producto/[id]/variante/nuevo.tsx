import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "@/components/ui/scroll-view";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectScrollView,
} from "@/components/ui/select";
import { ActivityIndicator, Image, Pressable, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Camera, ChevronDown, ImagePlus } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { request, baseUrl } from "@/constants/Request";
import { toast } from "sonner";

type Nivel = {
  id: number;
  niveles: number;
};

type Estante = {
  id: number;
  Seccion: string;
  pasillo: number;
  niveles?: Nivel[];
};

type Ubicacion = {
  id: number;
  nombre: string;
  estantes?: Estante[];
};

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

export default function NuevaVariante() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : null;

  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [selectedUbicacionId, setSelectedUbicacionId] = useState("");
  const [selectedEstanteId, setSelectedEstanteId] = useState("");
  const [selectedNivelId, setSelectedNivelId] = useState("");

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [color, setColor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [medidas, setMedidas] = useState("");
  const [precioPublico, setPrecioPublico] = useState("");
  const [precioContratista, setPrecioContratista] = useState("");
  const [costoCompra, setCostoCompra] = useState("");
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      setLoadingData(true);
      try {
        const response = await request("/stock/ubicaciones/ver", "GET");

        if (response.status === 200 && Array.isArray(response.data)) {
          setUbicaciones(response.data);
        }
      } catch (error) {
        console.error("Error cargando ubicaciones:", error);
        toast.error("No se pudieron cargar las ubicaciones");
      } finally {
        setLoadingData(false);
      }
    };

    fetchUbicaciones();
  }, []);

  const selectedUbicacion = useMemo(
    () => ubicaciones.find((item) => String(item.id) === selectedUbicacionId),
    [ubicaciones, selectedUbicacionId],
  );

  const availableEstantes = selectedUbicacion?.estantes ?? [];

  const selectedEstante = useMemo(
    () =>
      availableEstantes.find((item) => String(item.id) === selectedEstanteId),
    [availableEstantes, selectedEstanteId],
  );

  const availableNiveles = selectedEstante?.niveles ?? [];

  const resetUbicacionChain = () => {
    setSelectedEstanteId("");
    setSelectedNivelId("");
  };

  const resetEstanteChain = () => {
    setSelectedNivelId("");
  };

  const isFormValid =
    productId &&
    selectedNivelId &&
    nombre.trim() &&
    codigo.trim() &&
    color.trim() &&
    descripcion.trim() &&
    cantidad.trim() &&
    medidas.trim() &&
    precioPublico.trim() &&
    precioContratista.trim() &&
    costoCompra.trim() &&
    image?.uri;

  const pickImage = async (source: "camera" | "library") => {
    const permissions =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissions.granted) {
      toast.error("Permisos requeridos para seleccionar una foto");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    const filename = asset.fileName || uri.split("/").pop() || "foto.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = asset.mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`;

    setImage({
      uri,
      name: filename,
      type: mimeType,
    });
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) {
      toast.error("Completa todos los campos para continuar");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      formData.append("productoId", String(productId));
      formData.append("nivelesId", selectedNivelId);
      formData.append("nombre", nombre.trim());
      formData.append("codigo", codigo.trim());
      formData.append("color", color.trim());
      formData.append("descripcion", descripcion.trim());
      formData.append("cantidad", cantidad.trim());
      formData.append("medidas", medidas.trim());
      formData.append("precio_publico", precioPublico.trim());
      formData.append("precio_contratista", precioContratista.trim());
      formData.append("costo_compra", costoCompra.trim());

      if (image) {
        formData.append("foto", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      }

      const response = await fetch(
        `${baseUrl}/stock/productos/variantes/crear`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        },
      );

      if (response.ok) {
        toast.success("Variante creada correctamente");
        router.back();
      } else {
        const errorText = await response.text();
        toast.error("No se pudo crear la variante", {
          description: errorText || "Verifica los datos e intenta de nuevo",
        });
      }
    } catch (error) {
      console.error("Error creando variante:", error);
      toast.error("Error al crear la variante");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!productId || isNaN(productId)) {
    return (
      <ImageBackground
        source={require("@/assets/images/madera.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Center className="flex-1">
          <Text className="text-gray-400 text-base">Producto no valido</Text>
        </Center>
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
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="px-4 pt-6 mt-10">
          <Pressable onPress={() => router.back()}>
            <HStack space="sm" className="items-center">
              <ArrowLeft size={22} color="#13E000" strokeWidth={2} />
              <Text className="text-[#169500] text-base font-semibold">
                Volver
              </Text>
            </HStack>
          </Pressable>

          <Box className="mt-6">
            <Text className="text-white text-2xl font-bold">
              Nueva variante
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Completa los datos para registrar una variante del producto.
            </Text>
          </Box>

          {loadingData ? (
            <Center className="py-12">
              <ActivityIndicator size="large" color="#13E000" />
              <Text className="text-gray-400 text-base mt-3">
                Cargando datos...
              </Text>
            </Center>
          ) : (
            <VStack space="xl" className="mt-6">
              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Ubicacion y nivel
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Ubicacion
                    </Text>
                    <Select
                      selectedValue={selectedUbicacionId}
                      onValueChange={(value) => {
                        setSelectedUbicacionId(value);
                        resetUbicacionChain();
                      }}
                    >
                      <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                        <SelectInput
                          placeholder="Selecciona una ubicacion"
                          className="text-white"
                        />
                        <SelectIcon className="mr-3" as={ChevronDown} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectScrollView>
                            {ubicaciones.map((ubicacion) => (
                              <SelectItem
                                key={ubicacion.id}
                                label={ubicacion.nombre}
                                value={String(ubicacion.id)}
                              />
                            ))}
                          </SelectScrollView>
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Estante</Text>
                    <Select
                      selectedValue={selectedEstanteId}
                      onValueChange={(value) => {
                        setSelectedEstanteId(value);
                        resetEstanteChain();
                      }}
                      isDisabled={!selectedUbicacionId}
                    >
                      <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                        <SelectInput
                          placeholder={
                            selectedUbicacionId
                              ? "Selecciona un estante"
                              : "Selecciona una ubicacion primero"
                          }
                          className="text-white"
                        />
                        <SelectIcon className="mr-3" as={ChevronDown} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectScrollView>
                            {availableEstantes.map((estante) => (
                              <SelectItem
                                key={estante.id}
                                label={`Seccion ${estante.Seccion} • Pasillo ${estante.pasillo}`}
                                value={String(estante.id)}
                              />
                            ))}
                          </SelectScrollView>
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Nivel</Text>
                    <Select
                      selectedValue={selectedNivelId}
                      onValueChange={setSelectedNivelId}
                      isDisabled={!selectedEstanteId}
                    >
                      <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                        <SelectInput
                          placeholder={
                            selectedEstanteId
                              ? "Selecciona un nivel"
                              : "Selecciona un estante primero"
                          }
                          className="text-white"
                        />
                        <SelectIcon className="mr-3" as={ChevronDown} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectScrollView>
                            {availableNiveles.map((nivel) => (
                              <SelectItem
                                key={nivel.id}
                                label={`Nivel ${nivel.niveles}`}
                                value={String(nivel.id)}
                              />
                            ))}
                          </SelectScrollView>
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </Box>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Detalles de la variante
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Nombre</Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: Decoraciones El Lago"
                        value={nombre}
                        onChangeText={setNombre}
                        className="text-white"
                      />
                    </Input>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Codigo</Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: DL-200"
                        value={codigo}
                        onChangeText={setCodigo}
                        className="text-white"
                      />
                    </Input>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Color</Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: Azul"
                        value={color}
                        onChangeText={setColor}
                        className="text-white"
                      />
                    </Input>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Descripcion
                    </Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: Acabado resistente"
                        value={descripcion}
                        onChangeText={setDescripcion}
                        className="text-white"
                      />
                    </Input>
                  </Box>

                  <HStack space="md" className="items-start">
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">
                        Cantidad
                      </Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="0"
                          keyboardType="numeric"
                          value={cantidad}
                          onChangeText={setCantidad}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">
                        Medidas
                      </Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="Ej: 15x16x35"
                          value={medidas}
                          onChangeText={setMedidas}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                  </HStack>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Precios
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Precio publico
                    </Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="0"
                        keyboardType="numeric"
                        value={precioPublico}
                        onChangeText={setPrecioPublico}
                        className="text-white"
                      />
                    </Input>
                  </Box>
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Precio contratista
                    </Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="0"
                        keyboardType="numeric"
                        value={precioContratista}
                        onChangeText={setPrecioContratista}
                        className="text-white"
                      />
                    </Input>
                  </Box>
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Costo compra
                    </Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="0"
                        keyboardType="numeric"
                        value={costoCompra}
                        onChangeText={setCostoCompra}
                        className="text-white"
                      />
                    </Input>
                  </Box>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500]/30 rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Foto de la variante
                </Text>
                <VStack space="md">
                  {image ? (
                    <Box className="border border-[#169500]/40 rounded-2xl overflow-hidden">
                      <Image
                        source={{ uri: image.uri }}
                        style={{ width: "100%", height: 220 }}
                      />
                    </Box>
                  ) : (
                    <Center className="border border-dashed border-[#169500]/40 rounded-2xl py-8">
                      <ImagePlus size={36} color="#13E000" strokeWidth={1.5} />
                      <Text className="text-gray-400 text-sm mt-2">
                        Agrega una foto (JPG, PNG o WEBP)
                      </Text>
                    </Center>
                  )}

                  <HStack space="md" className="items-center">
                    <Button
                      variant="outline"
                      action="secondary"
                      className="flex-1 border-[#169500]"
                      onPress={() => pickImage("camera")}
                    >
                      <ButtonIcon as={Camera} className="text-[#169500]" />
                      <ButtonText className="text-[#169500]">
                        Tomar foto
                      </ButtonText>
                    </Button>
                    <Button
                      variant="outline"
                      action="secondary"
                      className="flex-1 border-[#169500]"
                      onPress={() => pickImage("library")}
                    >
                      <ButtonIcon as={ImagePlus} className="text-[#169500]" />
                      <ButtonText className="text-[#169500]">
                        Cargar
                      </ButtonText>
                    </Button>
                  </HStack>
                  {image && (
                    <Pressable onPress={() => setImage(null)}>
                      <Text className="text-gray-500 text-sm text-center">
                        Quitar foto
                      </Text>
                    </Pressable>
                  )}
                </VStack>
              </Box>

              <Button
                size="lg"
                action="primary"
                className="bg-[#13E000] rounded-xl"
                onPress={handleSubmit}
                isDisabled={!isFormValid || isSubmitting}
              >
                <ButtonText className="text-black font-semibold">
                  {isSubmitting ? "Guardando..." : "Crear variante"}
                </ButtonText>
              </Button>
            </VStack>
          )}
        </Box>
      </ScrollView>
    </ImageBackground>
  );
}
