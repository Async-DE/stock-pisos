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
import {
  ActivityIndicator,
  Image,
  Pressable,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  ImagePlus,
  Plus,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { request, baseUrl } from "@/constants/Request";
import { showSuccess, showError } from "@/utils/notifications";
import { BarcodeScannerModal } from "@/components/BarcodeScannerModal";
import { usePermissions } from "@/contexts/PermissionsContext";

type Subcategory = {
  id: number;
  nombre: string;
};

type Category = {
  id: number;
  nombre: string;
  subcategorias?: Subcategory[];
};

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

export default function NuevoProducto() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Redirigir si no tiene permisos para crear
  useEffect(() => {
    const checkPermissions = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("user_permisos");
      // Solo mostrar error si hay token y rol (usuario autenticado) pero sin permisos
      // Si no hay token o rol es null, está cerrando sesión y no debemos mostrar error
      if (!canCreate && token && role) {
        showError("No tienes permisos para crear productos");
        router.replace("/tabs/(tabs)/inicio");
      }
    };
    checkPermissions();
  }, [canCreate, router]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
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
  const [formResetKey, setFormResetKey] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Estados para crear estante
  const [showCreateEstante, setShowCreateEstante] = useState(false);
  const [pasillo, setPasillo] = useState("");
  const [seccion, setSeccion] = useState("");
  const [niveles, setNiveles] = useState("");
  const [isCreatingEstante, setIsCreatingEstante] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [categoriesResponse, ubicacionesResponse] = await Promise.all([
          request("/stock/categorias/ver", "GET"),
          request("/stock/ubicaciones/ver", "GET"),
        ]);

        // Procesar categorías: response.data tiene { message, data: [...] }
        if (categoriesResponse.status === 200) {
          // La respuesta del servidor es: { message: "...", data: [...] }
          const categoriasData = categoriesResponse.data?.data || categoriesResponse.data;
          
          if (Array.isArray(categoriasData)) {
            // Mapear la estructura de categorías
            const categoriasMapeadas = categoriasData.map((cat: any) => ({
              id: cat.id,
              nombre: cat.nombre || `Categoría ${cat.id}`,
              subcategorias: Array.isArray(cat.subcategorias)
                ? cat.subcategorias.map((sub: any) => ({
                    id: sub.id,
                    nombre: sub.nombre || `Subcategoría ${sub.id}`,
                  }))
                : [],
            }));
            
            console.log(`[${new Date().toLocaleTimeString()}] Categorías cargadas:`, categoriasMapeadas.length);
            setCategories(categoriasMapeadas);
          } else {
            console.warn("Formato de categorías no válido:", categoriasData);
          }
        }

        // Procesar ubicaciones: response.data tiene { message, data: [...] }
        if (ubicacionesResponse.status === 200) {
          // La respuesta del servidor es: { message: "...", data: [...] }
          const ubicacionesData = ubicacionesResponse.data?.data || ubicacionesResponse.data;
          
          if (Array.isArray(ubicacionesData)) {
            // Validar y mapear la estructura anidada de ubicaciones
            const ubicacionesMapeadas = ubicacionesData.map((ubicacion: any) => ({
              id: ubicacion.id,
              nombre: ubicacion.nombre || `Ubicación ${ubicacion.id}`,
              estantes: Array.isArray(ubicacion.estantes)
                ? ubicacion.estantes.map((estante: any) => ({
                    id: estante.id,
                    Seccion: estante.Seccion || "N/A",
                    pasillo: estante.pasillo || 0,
                    niveles: Array.isArray(estante.niveles)
                      ? estante.niveles.map((nivel: any) => ({
                          id: nivel.id,
                          niveles: nivel.niveles || 0,
                        }))
                      : [],
                  }))
                : [],
            }));
            
            console.log(`[${new Date().toLocaleTimeString()}] Ubicaciones cargadas:`, ubicacionesMapeadas.length);
            setUbicaciones(ubicacionesMapeadas);
          } else {
            console.warn("Formato de ubicaciones no válido:", ubicacionesData);
          }
        }
      } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Error cargando datos del formulario:`, error);
        showError("No se pudieron cargar los datos iniciales");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((cat) => String(cat.id) === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const availableSubcategories = selectedCategory?.subcategorias ?? [];

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

  const resetSubcategory = () => {
    setSelectedSubcategoryId("");
  };

  const resetUbicacionChain = () => {
    setSelectedEstanteId("");
    setSelectedNivelId("");
    setShowCreateEstante(false);
    setPasillo("");
    setSeccion("");
    setNiveles("");
  };

  const resetEstanteChain = () => {
    setSelectedNivelId("");
  };

  const reloadUbicaciones = async () => {
    try {
      const ubicacionesResponse = await request("/stock/ubicaciones/ver", "GET");
      
      if (ubicacionesResponse.status === 200) {
        // La respuesta del servidor es: { message: "...", data: [...] }
        const ubicacionesData = ubicacionesResponse.data?.data || ubicacionesResponse.data;
        
        if (Array.isArray(ubicacionesData)) {
          const ubicacionesMapeadas = ubicacionesData.map((ubicacion: any) => ({
            id: ubicacion.id,
            nombre: ubicacion.nombre || `Ubicación ${ubicacion.id}`,
            estantes: Array.isArray(ubicacion.estantes)
              ? ubicacion.estantes.map((estante: any) => ({
                  id: estante.id,
                  Seccion: estante.Seccion || "N/A",
                  pasillo: estante.pasillo || 0,
                  niveles: Array.isArray(estante.niveles)
                    ? estante.niveles.map((nivel: any) => ({
                        id: nivel.id,
                        niveles: nivel.niveles || 0,
                      }))
                    : [],
                }))
              : [],
          }));
          
          setUbicaciones(ubicacionesMapeadas);
        }
      }
    } catch (error) {
      console.error("Error recargando ubicaciones:", error);
    }
  };

  const handleCreateEstante = async () => {
    if (!selectedUbicacionId || !pasillo.trim() || !seccion.trim() || !niveles.trim()) {
      showError("Completa todos los campos para crear el estante");
      return;
    }

    const pasilloNum = parseInt(pasillo);
    const nivelesNum = parseInt(niveles);

    if (isNaN(pasilloNum) || isNaN(nivelesNum) || pasilloNum <= 0 || nivelesNum <= 0) {
      showError("El pasillo y niveles deben ser números válidos mayores a 0");
      return;
    }

    setIsCreatingEstante(true);
    try {
      const response = await request("/stock/estantes/crear", "POST", {
        pasillo: pasilloNum,
        seccion: seccion.trim().toUpperCase(),
        niveles: nivelesNum,
        ubicacionId: parseInt(selectedUbicacionId),
      });

      if (response.status === 200 || response.status === 201) {
        showSuccess("Estante creado correctamente");
        // Limpiar formulario de creación
        setPasillo("");
        setSeccion("");
        setNiveles("");
        setShowCreateEstante(false);
        // Recargar ubicaciones para mostrar el nuevo estante
        await reloadUbicaciones();
      } else {
        showError("No se pudo crear el estante");
      }
    } catch (error) {
      console.error("Error creando estante:", error);
      showError("Error al crear el estante");
    } finally {
      setIsCreatingEstante(false);
    }
  };

  const clearForm = () => {
    setSelectedCategoryId("");
    setSelectedSubcategoryId("");
    setSelectedUbicacionId("");
    setSelectedEstanteId("");
    setSelectedNivelId("");
    setNombre("");
    setCodigo("");
    setColor("");
    setDescripcion("");
    setCantidad("");
    setMedidas("");
    setPrecioPublico("");
    setPrecioContratista("");
    setCostoCompra("");
    setImage(null);
    // Incrementar la key para forzar re-render de todos los selects
    setFormResetKey((prev) => prev + 1);
  };

  const handleBack = () => {
    clearForm();
    router.back();
  };

  const isFormValid =
    selectedSubcategoryId &&
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
      showError("Permisos requeridos para seleccionar una foto");
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
      showError("Completa todos los campos para continuar");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      formData.append("subcategoriaId", selectedSubcategoryId);
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

      const response = await fetch(`${baseUrl}/stock/productos/crear`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (response.ok) {
        showSuccess("Producto creado correctamente");
        clearForm();
        router.back();
      } else {
        const errorText = await response.text();
        showError(errorText || "No se pudo crear el producto. Verifica los datos e intenta de nuevo");
      }
    } catch (error) {
      console.error("Error creando producto:", error);
      showError("Error al crear el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Box className="px-4 pt-6 mt-8">
          <Pressable onPress={handleBack}>
            <HStack space="sm" className="items-center">
              <ArrowLeft size={22} color="#13E000" strokeWidth={2} />
              <Text className="text-[#169500] text-base font-semibold">
                Volver
              </Text>
            </HStack>
          </Pressable>

          <Box className="mt-6">
            <Text className="text-white text-2xl font-bold">
              Crear producto
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Completa los datos para registrar un nuevo producto en el sistema.
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
                  Categoría y subcategoría
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Categoría
                    </Text>
                    <Select
                      key={`category-${formResetKey}`}
                      selectedValue={selectedCategoryId}
                      onValueChange={(value) => {
                        setSelectedCategoryId(value);
                        resetSubcategory();
                      }}
                    >
                      <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                        <SelectInput
                          placeholder="Selecciona una categoría"
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
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                label={category.nombre}
                                value={String(category.id)}
                              />
                            ))}
                          </SelectScrollView>
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Subcategoría
                    </Text>
                    <Select
                      key={`subcategory-${formResetKey}-${selectedCategoryId || "no-category"}`}
                      selectedValue={selectedSubcategoryId}
                      onValueChange={setSelectedSubcategoryId}
                      isDisabled={!selectedCategoryId}
                    >
                      <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                        <SelectInput
                          placeholder={
                            selectedCategoryId
                              ? "Selecciona una subcategoría"
                              : "Selecciona una categoría primero"
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
                            {availableSubcategories.length > 0 ? (
                              availableSubcategories.map((subcategory) => (
                                <SelectItem
                                  key={subcategory.id}
                                  label={subcategory.nombre}
                                  value={String(subcategory.id)}
                                />
                              ))
                            ) : (
                              <SelectItem
                                label="No hay subcategorías disponibles"
                                value=""
                                isDisabled
                              />
                            )}
                          </SelectScrollView>
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </Box>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Ubicación y nivel
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Ubicación
                    </Text>
                    <Select
                      key={`ubicacion-${formResetKey}`}
                      selectedValue={selectedUbicacionId}
                      onValueChange={(value) => {
                        setSelectedUbicacionId(value);
                        resetUbicacionChain();
                      }}
                    >
                      <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                        <SelectInput
                          placeholder="Selecciona una ubicación"
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
                    <HStack className="items-center justify-between mb-2">
                      <Text className="text-gray-400 text-sm">Estante</Text>
                      {selectedUbicacionId && availableEstantes.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#169500]"
                          onPress={() => setShowCreateEstante(!showCreateEstante)}
                        >
                          <ButtonIcon as={Plus} className="text-[#169500]" />
                          <ButtonText className="text-[#169500] text-xs">
                            {showCreateEstante ? "Seleccionar" : "Crear"}
                          </ButtonText>
                        </Button>
                      )}
                    </HStack>
                    
                    {selectedUbicacionId && (
                      availableEstantes.length === 0 || showCreateEstante ? (
                        // Vista para crear estante
                        <Box className="bg-secondary-600/50 border border-[#169500]/50 rounded-xl p-4">
                          <Text className="text-white font-semibold text-sm mb-3">
                            Crear nuevo estante
                          </Text>
                          <VStack space="md">
                            <Box>
                              <Text className="text-gray-400 text-xs mb-2">Pasillo</Text>
                              <Input className="bg-secondary-700 border-[#169500] rounded-lg">
                                <InputField
                                  placeholder="Ej: 1"
                                  keyboardType="numeric"
                                  value={pasillo}
                                  onChangeText={setPasillo}
                                  className="text-white"
                                />
                              </Input>
                            </Box>
                            <Box>
                              <Text className="text-gray-400 text-xs mb-2">Sección</Text>
                              <Input className="bg-secondary-700 border-[#169500] rounded-lg">
                                <InputField
                                  placeholder="Ej: A"
                                  value={seccion}
                                  onChangeText={setSeccion}
                                  className="text-white"
                                  maxLength={1}
                                />
                              </Input>
                            </Box>
                            <Box>
                              <Text className="text-gray-400 text-xs mb-2">Niveles</Text>
                              <Input className="bg-secondary-700 border-[#169500] rounded-lg">
                                <InputField
                                  placeholder="Ej: 4"
                                  keyboardType="numeric"
                                  value={niveles}
                                  onChangeText={setNiveles}
                                  className="text-white"
                                />
                              </Input>
                            </Box>
                            <Button
                              size="sm"
                              action="primary"
                              className="bg-[#13E000] rounded-lg mt-2"
                              onPress={handleCreateEstante}
                              isDisabled={isCreatingEstante || !pasillo.trim() || !seccion.trim() || !niveles.trim()}
                            >
                              <ButtonText className="text-black font-semibold text-sm">
                                {isCreatingEstante ? "Creando..." : "Crear estante"}
                              </ButtonText>
                            </Button>
                            {availableEstantes.length > 0 && (
                              <Pressable onPress={() => setShowCreateEstante(false)}>
                                <Text className="text-gray-400 text-xs text-center mt-2">
                                  Cancelar
                                </Text>
                              </Pressable>
                            )}
                          </VStack>
                        </Box>
                      ) : (
                        // Vista para seleccionar estante
                        <Select
                          key={`estante-${formResetKey}-${selectedUbicacionId || "no-ubicacion"}`}
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
                                  : "Selecciona una ubicación primero"
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
                                {availableEstantes.length > 0 ? (
                                  availableEstantes.map((estante) => (
                                    <SelectItem
                                      key={estante.id}
                                      label={`Sección ${estante.Seccion} • Pasillo ${estante.pasillo}`}
                                      value={String(estante.id)}
                                    />
                                  ))
                                ) : (
                                  <SelectItem
                                    label="No hay estantes disponibles"
                                    value=""
                                    isDisabled
                                  />
                                )}
                              </SelectScrollView>
                            </SelectContent>
                          </SelectPortal>
                        </Select>
                      )
                    )}
                    
                    {!selectedUbicacionId && (
                      <Box className="bg-secondary-600/50 border border-[#169500]/30 rounded-xl p-4">
                        <Text className="text-gray-500 text-sm text-center">
                          Selecciona una ubicación primero
                        </Text>
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Nivel</Text>
                    <Select
                      key={`nivel-${formResetKey}-${selectedEstanteId || "no-estante"}`}
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
                            {availableNiveles.length > 0 ? (
                              availableNiveles.map((nivel) => (
                                <SelectItem
                                  key={nivel.id}
                                  label={`Nivel ${nivel.niveles}`}
                                  value={String(nivel.id)}
                                />
                              ))
                            ) : (
                              <SelectItem
                                label="No hay niveles disponibles"
                                value=""
                                isDisabled
                              />
                            )}
                          </SelectScrollView>
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  </Box>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Detalles del producto
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Nombre</Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: Pisos Laminados Premium"
                        value={nombre}
                        onChangeText={setNombre}
                        className="text-white"
                      />
                    </Input>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Código</Text>
                    <HStack space="sm" className="items-center">
                      <Input className="flex-1 bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="Ej: PL-102"
                          value={codigo}
                          onChangeText={setCodigo}
                          className="text-white"
                        />
                      </Input>
                      <Pressable
                        onPress={() => setIsScannerOpen(true)}
                        className="bg-[#169500] rounded-xl px-3 py-3 ml-1"
                        hitSlop={10}
                      >
                        <Camera size={20} color="#000000" strokeWidth={2} />
                      </Pressable>
                    </HStack>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Color</Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: Nogal"
                        value={color}
                        onChangeText={setColor}
                        className="text-white"
                      />
                    </Input>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Descripción
                    </Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: Acabado resistente, ideal para interiores"
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
                      Precio público
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

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Foto del producto
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
                  {isSubmitting ? "Guardando..." : "Crear producto"}
                </ButtonText>
              </Button>
            </VStack>
          )}
        </Box>
      </ScrollView>
      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={(code) => {
          setCodigo(code);
        }}
        title="Escanear código del producto"
      />
    </ImageBackground>
  );
}
