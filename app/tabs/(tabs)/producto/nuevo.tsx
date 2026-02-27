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

type UbicacionAlmacen = {
  id: number;
  codigo: string;
  tipo?: string;
  descripcion?: string;
};

type Ubicacion = {
  id: number;
  nombre: string;
  ubicacioneAlmacen?: UbicacionAlmacen[];
};

const mapUbicacionesFromResponse = (ubicacionesData: any[]): Ubicacion[] => {
  return ubicacionesData.map((ubicacion: any) => {
    const estantesLegacy = Array.isArray(ubicacion.estantes)
      ? ubicacion.estantes.map((estante: any) => ({
          id: estante.id,
          codigo: `${estante.Seccion || "N/A"}-${estante.pasillo || 0}`,
          tipo: "estante",
          descripcion: `Sección ${estante.Seccion || "N/A"} • Pasillo ${estante.pasillo || 0}`,
        }))
      : [];

    const estantesFromUbicacionAlmacen = Array.isArray(
      ubicacion.ubicacione_almacen,
    )
      ? ubicacion.ubicacione_almacen.map((item: any) => ({
          id: item.id,
          codigo: item.codigo || "N/A",
          tipo: item.tipo,
          descripcion: item.descripcion,
        }))
      : [];

    return {
      id: ubicacion.id,
      nombre: ubicacion.nombre || `Ubicación ${ubicacion.id}`,
      ubicacioneAlmacen:
        estantesLegacy.length > 0
          ? estantesLegacy
          : estantesFromUbicacionAlmacen,
    };
  });
};

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

const ALLOWED_IMAGE_EXTENSIONS = ["jpeg", "jpg", "png", "webp"];
const MAX_FILES = 5;

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

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [color, setColor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [alto, setAlto] = useState("");
  const [ancho, setAncho] = useState("");
  const [largo, setLargo] = useState("");
  const [precioPublico, setPrecioPublico] = useState("");
  const [precioContratista, setPrecioContratista] = useState("");
  const [costoCompra, setCostoCompra] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Estados para crear estante
  const [showCreateEstante, setShowCreateEstante] = useState(false);
  const [pasillo, setPasillo] = useState("");
  const [seccion, setSeccion] = useState("");
  const [codigoAlmacenManual, setCodigoAlmacenManual] = useState("");
  const [tipoAlmacen, setTipoAlmacen] = useState("");
  const [descripcionAlmacen, setDescripcionAlmacen] = useState("");
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
          const categoriasData =
            categoriesResponse.data?.data || categoriesResponse.data;

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

            console.log(
              `[${new Date().toLocaleTimeString()}] Categorías cargadas:`,
              categoriasMapeadas.length,
            );
            setCategories(categoriasMapeadas);
          } else {
            console.warn("Formato de categorías no válido:", categoriasData);
          }
        }

        // Procesar ubicaciones: response.data tiene { message, data: [...] }
        if (ubicacionesResponse.status === 200) {
          // La respuesta del servidor es: { message: "...", data: [...] }
          const ubicacionesData =
            ubicacionesResponse.data?.data || ubicacionesResponse.data;

          if (Array.isArray(ubicacionesData)) {
            // Validar y mapear la estructura anidada de ubicaciones
            const ubicacionesMapeadas =
              mapUbicacionesFromResponse(ubicacionesData);

            console.log(
              `[${new Date().toLocaleTimeString()}] Ubicaciones cargadas:`,
              ubicacionesMapeadas.length,
            );
            setUbicaciones(ubicacionesMapeadas);
          } else {
            console.warn("Formato de ubicaciones no válido:", ubicacionesData);
          }
        }
      } catch (error) {
        console.error(
          `[${new Date().toLocaleTimeString()}] Error cargando datos del formulario:`,
          error,
        );
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

  const availableEstantes = selectedUbicacion?.ubicacioneAlmacen ?? [];

  const resetSubcategory = () => {
    setSelectedSubcategoryId("");
  };

  const resetUbicacionChain = () => {
    setSelectedEstanteId("");
    setShowCreateEstante(false);
    setPasillo("");
    setSeccion("");
    setCodigoAlmacenManual("");
    setTipoAlmacen("");
    setDescripcionAlmacen("");
  };

  const reloadUbicaciones = async () => {
    try {
      const ubicacionesResponse = await request(
        "/stock/ubicaciones/ver",
        "GET",
      );

      if (ubicacionesResponse.status === 200) {
        // La respuesta del servidor es: { message: "...", data: [...] }
        const ubicacionesData =
          ubicacionesResponse.data?.data || ubicacionesResponse.data;

        if (Array.isArray(ubicacionesData)) {
          const ubicacionesMapeadas =
            mapUbicacionesFromResponse(ubicacionesData);

          setUbicaciones(ubicacionesMapeadas);
        }
      }
    } catch (error) {
      console.error("Error recargando ubicaciones:", error);
    }
  };

  const handleCreateEstante = async () => {
    if (!selectedUbicacionId) {
      showError("Selecciona una ubicación para crear la ubicación de almacén");
      return;
    }

    const codigoManual = codigoAlmacenManual.trim();
    const hasPasillo = pasillo.trim().length > 0;
    const hasSeccion = seccion.trim().length > 0;
    const hasPair = hasPasillo && hasSeccion;
    const hasHalfPair = hasPasillo !== hasSeccion;

    if (!codigoManual && !hasPair) {
      showError("Ingresa Código manual o completa Pasillo y Sección");
      return;
    }

    if (hasHalfPair) {
      showError("Para usar Pasillo/Sección debes completar ambos campos");
      return;
    }

    let codigoFinal = codigoManual;
    if (!codigoFinal && hasPair) {
      const pasilloNum = parseInt(pasillo, 10);
      if (isNaN(pasilloNum) || pasilloNum <= 0) {
        showError("El pasillo debe ser un número válido mayor a 0");
        return;
      }

      codigoFinal = `${seccion.trim().toUpperCase()}-${pasilloNum}`;
    }

    setIsCreatingEstante(true);
    try {
      const payload: {
        codigo?: string;
        ubicacion_id: number;
        tipo?: string;
        descripcion?: string;
      } = {
        ubicacion_id: parseInt(selectedUbicacionId, 10),
      };

      if (codigoFinal) {
        payload.codigo = codigoFinal;
      }

      if (tipoAlmacen.trim()) {
        payload.tipo = tipoAlmacen.trim();
      }

      if (descripcionAlmacen.trim()) {
        payload.descripcion = descripcionAlmacen.trim();
      }

      const response = await request(
        "/stock/ubicacion-almacen/crear",
        "POST",
        payload,
      );

      if (response.status === 200 || response.status === 201) {
        showSuccess("Ubicación de almacén creada correctamente");
        // Limpiar formulario de creación
        setPasillo("");
        setSeccion("");
        setCodigoAlmacenManual("");
        setTipoAlmacen("");
        setDescripcionAlmacen("");
        setShowCreateEstante(false);
        // Recargar ubicaciones para mostrar el nuevo estante
        await reloadUbicaciones();
      } else {
        showError("No se pudo crear la ubicación de almacén");
      }
    } catch (error) {
      console.error("Error creando ubicación de almacén:", error);
      showError("Error al crear la ubicación de almacén");
    } finally {
      setIsCreatingEstante(false);
    }
  };

  const clearForm = () => {
    setSelectedCategoryId("");
    setSelectedSubcategoryId("");
    setSelectedUbicacionId("");
    setSelectedEstanteId("");
    setNombre("");
    setCodigo("");
    setColor("");
    setDescripcion("");
    setCantidad("");
    setAlto("");
    setAncho("");
    setLargo("");
    setPrecioPublico("");
    setPrecioContratista("");
    setCostoCompra("");
    setImages([]);
    setCodigoAlmacenManual("");
    // Incrementar la key para forzar re-render de todos los selects
    setFormResetKey((prev) => prev + 1);
  };

  const handleBack = () => {
    clearForm();
    router.back();
  };

  const isFormValid =
    selectedSubcategoryId &&
    selectedEstanteId &&
    nombre.trim() &&
    codigo.trim() &&
    color.trim() &&
    descripcion.trim() &&
    cantidad.trim() &&
    precioPublico.trim() &&
    precioContratista.trim() &&
    costoCompra.trim() &&
    images.length > 0 &&
    images.length <= MAX_FILES;

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
            allowsMultipleSelection: true,
            selectionLimit: MAX_FILES,
          });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const selectedFromPicker: SelectedImage[] = result.assets
      .map((asset) => {
        const uri = asset.uri;
        const filename = asset.fileName || uri.split("/").pop() || "foto.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = (
          asset.mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`
        ).toLowerCase();
        return {
          uri,
          name: filename,
          type: mimeType,
        };
      })
      .filter((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const mimeSubtype = file.type.split("/")[1] || "";
        return (
          ALLOWED_IMAGE_EXTENSIONS.includes(ext) ||
          ALLOWED_IMAGE_EXTENSIONS.includes(mimeSubtype)
        );
      });

    if (!selectedFromPicker.length) {
      showError("Solo se permiten imágenes JPG, JPEG, PNG o WEBP");
      return;
    }

    setImages((prev) => {
      const merged = [...prev, ...selectedFromPicker].filter(
        (file, index, arr) =>
          arr.findIndex((item) => item.uri === file.uri) === index,
      );

      if (merged.length > MAX_FILES) {
        showError(`Máximo ${MAX_FILES} imágenes`);
      }

      return merged.slice(0, MAX_FILES);
    });
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((image) => image.uri !== uri));
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
      formData.append("ubi_alma_id", selectedEstanteId);
      formData.append("nombre", nombre.trim());
      formData.append("codigo", codigo.trim());
      formData.append("color", color.trim());
      formData.append("descripcion", descripcion.trim());
      formData.append("cantidad", cantidad.trim());
      formData.append("precio_publico", precioPublico.trim());
      formData.append("precio_contratista", precioContratista.trim());
      formData.append("costo_compra", costoCompra.trim());

      if (alto.trim()) {
        formData.append("alto", alto.trim());
      }

      if (ancho.trim()) {
        formData.append("ancho", ancho.trim());
      }

      if (largo.trim()) {
        formData.append("largo", largo.trim());
      }

      if (images.length === 0) {
        showError("Debes agregar al menos 1 imagen");
        setIsSubmitting(false);
        return;
      }

      for (const image of images) {
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
        console.log("Error response text:", errorText);
        showError(
          errorText ||
            "No se pudo crear el producto. Verifica los datos e intenta de nuevo",
        );
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
                      Categoría *
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
                      Subcategoría *
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
                  Ubicación y estante
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Ubicación *
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
                      <Text className="text-gray-400 text-sm">
                        Ubicación almacén *
                      </Text>
                      {selectedUbicacionId && availableEstantes.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#169500]"
                          onPress={() =>
                            setShowCreateEstante(!showCreateEstante)
                          }
                        >
                          <ButtonIcon as={Plus} className="text-[#169500]" />
                          <ButtonText className="text-[#169500] text-xs">
                            {showCreateEstante ? "Seleccionar" : "Crear"}
                          </ButtonText>
                        </Button>
                      )}
                    </HStack>

                    {selectedUbicacionId &&
                      (availableEstantes.length === 0 || showCreateEstante ? (
                        // Vista para crear estante
                        <Box className="bg-secondary-600/50 border border-[#169500]/50 rounded-xl p-4">
                          <Text className="text-white font-semibold text-sm mb-3">
                            Crear ubicación almacén
                          </Text>
                          <Text className="text-gray-500 text-xs mb-3">
                            Código es opcional. También puedes generarlo con
                            Pasillo + Sección.
                          </Text>
                          <VStack space="md">
                            <Box>
                              <Text className="text-gray-400 text-xs mb-2">
                                Código (manual, opcional)
                              </Text>
                              <Input className="bg-secondary-700 border-[#169500] rounded-lg">
                                <InputField
                                  placeholder="Ej: A-1"
                                  value={codigoAlmacenManual}
                                  onChangeText={setCodigoAlmacenManual}
                                  className="text-white"
                                />
                              </Input>
                            </Box>

                            <Box>
                              <Text className="text-gray-400 text-xs mb-2">
                                Pasillo (opcional)
                              </Text>
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
                              <Text className="text-gray-400 text-xs mb-2">
                                Sección (opcional)
                              </Text>
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
                            <Text className="text-gray-500 text-xs">
                              Debes ingresar Código manual o completar Pasillo y
                              Sección.
                            </Text>
                            <Box>
                              <Text className="text-gray-400 text-xs mb-2">
                                Tipo (opcional)
                              </Text>
                              <Input className="bg-secondary-700 border-[#169500] rounded-lg">
                                <InputField
                                  placeholder="Ej: estante"
                                  value={tipoAlmacen}
                                  onChangeText={setTipoAlmacen}
                                  className="text-white"
                                />
                              </Input>
                            </Box>
                            <Box>
                              <Text className="text-gray-400 text-xs mb-2">
                                Descripción (opcional)
                              </Text>
                              <Input className="bg-secondary-700 border-[#169500] rounded-lg">
                                <InputField
                                  placeholder="Ej: Estante A, pasillo 1"
                                  value={descripcionAlmacen}
                                  onChangeText={setDescripcionAlmacen}
                                  className="text-white"
                                />
                              </Input>
                            </Box>
                            <Button
                              size="sm"
                              action="primary"
                              className="bg-[#13E000] rounded-lg mt-2"
                              onPress={handleCreateEstante}
                              isDisabled={
                                isCreatingEstante || !selectedUbicacionId
                              }
                            >
                              <ButtonText className="text-black font-semibold text-sm">
                                {isCreatingEstante
                                  ? "Creando..."
                                  : "Crear ubicación"}
                              </ButtonText>
                            </Button>
                            {availableEstantes.length > 0 && (
                              <Pressable
                                onPress={() => setShowCreateEstante(false)}
                              >
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
                          onValueChange={setSelectedEstanteId}
                          isDisabled={!selectedUbicacionId}
                        >
                          <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                            <SelectInput
                              placeholder={
                                selectedUbicacionId
                                  ? "Selecciona una ubicación de almacén"
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
                                      label={
                                        estante.descripcion
                                          ? `${estante.codigo} • ${estante.descripcion}`
                                          : estante.codigo
                                      }
                                      value={String(estante.id)}
                                    />
                                  ))
                                ) : (
                                  <SelectItem
                                    label="No hay ubicaciones de almacén disponibles"
                                    value=""
                                    isDisabled
                                  />
                                )}
                              </SelectScrollView>
                            </SelectContent>
                          </SelectPortal>
                        </Select>
                      ))}

                    {!selectedUbicacionId && (
                      <Box className="bg-secondary-600/50 border border-[#169500]/30 rounded-xl p-4">
                        <Text className="text-gray-500 text-sm text-center">
                          Selecciona una ubicación primero
                        </Text>
                      </Box>
                    )}
                  </Box>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Detalles del producto
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Nombre *</Text>
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
                    <Text className="text-gray-400 text-sm mb-2">Código *</Text>
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
                    <Text className="text-gray-400 text-sm mb-2">Color *</Text>
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
                      Descripción *
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
                        Cantidad *
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
                  </HStack>

                  <HStack space="md" className="items-start">
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">
                        Alto (opcional)
                      </Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="Ej: 10.5"
                          keyboardType="numeric"
                          value={alto}
                          onChangeText={setAlto}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">
                        Ancho (opcional)
                      </Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="Ej: 5.0"
                          keyboardType="numeric"
                          value={ancho}
                          onChangeText={setAncho}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                  </HStack>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Largo (opcional)
                    </Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: 2.0"
                        keyboardType="numeric"
                        value={largo}
                        onChangeText={setLargo}
                        className="text-white"
                      />
                    </Input>
                  </Box>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Precios
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Precio público *
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
                      Precio contratista *
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
                      Costo compra *
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
                  Foto del producto *
                </Text>
                <VStack space="md">
                  {images.length > 0 ? (
                    <VStack space="sm">
                      <Box className="border border-[#169500]/40 rounded-2xl overflow-hidden">
                        <Image
                          source={{ uri: images[0].uri }}
                          style={{ width: "100%", height: 220 }}
                        />
                      </Box>

                      <HStack space="sm" className="flex-wrap">
                        {images.map((image, index) => (
                          <Box
                            key={image.uri}
                            className="w-[31%] border border-[#169500]/30 rounded-lg p-1"
                          >
                            <Image
                              source={{ uri: image.uri }}
                              style={{
                                width: "100%",
                                height: 72,
                                borderRadius: 8,
                              }}
                            />
                            <Pressable
                              onPress={() => removeImage(image.uri)}
                              className="mt-1 bg-secondary-700 border border-[#169500]/40 rounded-md px-2 py-1"
                            >
                              <Text className="text-gray-300 text-xs text-center">
                                Quitar #{index + 1}
                              </Text>
                            </Pressable>
                          </Box>
                        ))}
                      </HStack>
                    </VStack>
                  ) : (
                    <Center className="border border-dashed border-[#169500]/40 rounded-2xl py-8">
                      <ImagePlus size={36} color="#13E000" strokeWidth={1.5} />
                      <Text className="text-gray-400 text-sm mt-2">
                        Agrega entre 1 y 5 fotos (JPG, JPEG, PNG o WEBP)
                      </Text>
                    </Center>
                  )}

                  {images.length > 0 && (
                    <Text className="text-gray-400 text-xs text-center">
                      {images.length} de {MAX_FILES} imágenes seleccionadas
                    </Text>
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
                      <ButtonText className="text-[#169500]">Cargar</ButtonText>
                    </Button>
                  </HStack>
                  {images.length > 0 && (
                    <Pressable onPress={() => setImages([])}>
                      <Text className="text-gray-500 text-sm text-center">
                        Quitar fotos
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
