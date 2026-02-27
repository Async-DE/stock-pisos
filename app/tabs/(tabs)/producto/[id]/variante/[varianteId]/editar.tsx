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
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { usePermissions } from "@/contexts/PermissionsContext";

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

type ExistingPhoto = {
  id: number;
  url: string;
};

type UbicacionAlmacenOption = {
  id: number;
  label: string;
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

type VariantSnapshot = {
  ubi_alma_id: string;
  nombre: string;
  codigo: string;
  color: string;
  descripcion: string;
  cantidad: string;
  precio_publico: string;
  precio_contratista: string;
  costo_compra: string;
  alto: string;
  ancho: string;
  largo: string;
};

const ALLOWED_IMAGE_EXTENSIONS = ["jpeg", "jpg", "png", "webp"];
const MAX_FILES = 5;

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

export default function EditarVariante() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const { id, varianteId } = useLocalSearchParams<{
    id: string;
    varianteId: string;
  }>();

  const productId = id ? parseInt(id, 10) : null;
  const currentVarianteId = varianteId ? parseInt(varianteId, 10) : null;

  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [ubicacionOptions, setUbicacionOptions] = useState<
    UbicacionAlmacenOption[]
  >([]);

  const [selectedUbicacionId, setSelectedUbicacionId] = useState("");
  const [showCreateEstante, setShowCreateEstante] = useState(false);
  const [pasillo, setPasillo] = useState("");
  const [seccion, setSeccion] = useState("");
  const [codigoAlmacenManual, setCodigoAlmacenManual] = useState("");
  const [tipoAlmacen, setTipoAlmacen] = useState("");
  const [descripcionAlmacen, setDescripcionAlmacen] = useState("");
  const [isCreatingEstante, setIsCreatingEstante] = useState(false);

  const [selectedUbiAlmaId, setSelectedUbiAlmaId] = useState("");
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [color, setColor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioPublico, setPrecioPublico] = useState("");
  const [precioContratista, setPrecioContratista] = useState("");
  const [costoCompra, setCostoCompra] = useState("");
  const [alto, setAlto] = useState("");
  const [ancho, setAncho] = useState("");
  const [largo, setLargo] = useState("");

  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [fotosEliminar, setFotosEliminar] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<SelectedImage[]>([]);

  const [initialSnapshot, setInitialSnapshot] =
    useState<VariantSnapshot | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("user_permisos");
      if (!canCreate && token && role) {
        showError("No tienes permisos para editar variantes");
        router.replace(`/tabs/(tabs)/producto/${productId || ""}`);
      }
    };

    checkPermissions();
  }, [canCreate, router, productId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId || !currentVarianteId) {
        setLoadingData(false);
        showError("Parámetros inválidos para editar variante");
        return;
      }

      setLoadingData(true);
      try {
        const [productoResponse, ubicacionesResponse] = await Promise.all([
          request(`/stock/productos/ver/${productId}`, "GET"),
          request("/stock/ubicaciones/ver", "GET"),
        ]);

        const productoData =
          productoResponse.data?.data || productoResponse.data;

        if (productoResponse.status !== 200 || !productoData) {
          showError("No se pudo cargar la variante");
          return;
        }

        const variante = Array.isArray(productoData.variantes)
          ? productoData.variantes.find(
              (item: any) => item.id === currentVarianteId,
            )
          : null;

        if (!variante) {
          showError("Variante no encontrada");
          return;
        }

        const snapshot: VariantSnapshot = {
          ubi_alma_id: variante.ubicacion_almacen_id
            ? String(variante.ubicacion_almacen_id)
            : "",
          nombre: variante.nombre || "",
          codigo: variante.codigo || "",
          color: variante.color || "",
          descripcion: variante.descripcion || "",
          cantidad: variante.cantidad != null ? String(variante.cantidad) : "",
          precio_publico:
            variante.precio_publico != null
              ? String(variante.precio_publico)
              : "",
          precio_contratista:
            variante.precio_contratista != null
              ? String(variante.precio_contratista)
              : "",
          costo_compra:
            variante.costo_compra != null ? String(variante.costo_compra) : "",
          alto: variante.alto != null ? String(variante.alto) : "",
          ancho: variante.ancho != null ? String(variante.ancho) : "",
          largo: variante.largo != null ? String(variante.largo) : "",
        };

        setInitialSnapshot(snapshot);
        setSelectedUbiAlmaId(snapshot.ubi_alma_id);
        setNombre(snapshot.nombre);
        setCodigo(snapshot.codigo);
        setColor(snapshot.color);
        setDescripcion(snapshot.descripcion);
        setCantidad(snapshot.cantidad);
        setPrecioPublico(snapshot.precio_publico);
        setPrecioContratista(snapshot.precio_contratista);
        setCostoCompra(snapshot.costo_compra);
        setAlto(snapshot.alto);
        setAncho(snapshot.ancho);
        setLargo(snapshot.largo);

        const fotos = Array.isArray(variante.fotos)
          ? variante.fotos
              .map((foto: any) => ({
                id: foto.id,
                url: foto.url,
              }))
              .filter((foto: ExistingPhoto) => foto.id && foto.url)
          : [];

        setExistingPhotos(fotos);

        const ubicacionesData =
          ubicacionesResponse.data?.data || ubicacionesResponse.data;
        if (
          ubicacionesResponse.status === 200 &&
          Array.isArray(ubicacionesData)
        ) {
          const ubicacionesMapeadas =
            mapUbicacionesFromResponse(ubicacionesData);
          setUbicaciones(ubicacionesMapeadas);

          const options: UbicacionAlmacenOption[] = [];

          ubicacionesMapeadas.forEach((ubicacion) => {
            if (!Array.isArray(ubicacion.ubicacioneAlmacen)) {
              return;
            }

            ubicacion.ubicacioneAlmacen.forEach((item) => {
              options.push({
                id: item.id,
                label: `${ubicacion.nombre || "Ubicación"} • ${item.codigo || "N/A"}`,
              });
            });
          });

          setUbicacionOptions(options);

          const currentUbicacion = ubicacionesMapeadas.find((ubicacion) =>
            (ubicacion.ubicacioneAlmacen || []).some(
              (item) => String(item.id) === snapshot.ubi_alma_id,
            ),
          );

          if (currentUbicacion) {
            setSelectedUbicacionId(String(currentUbicacion.id));
          }
        }
      } catch (error) {
        console.error("Error cargando datos para editar variante:", error);
        showError("No se pudieron cargar los datos de la variante");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [productId, currentVarianteId]);

  const selectedUbicacion = useMemo(
    () => ubicaciones.find((item) => String(item.id) === selectedUbicacionId),
    [ubicaciones, selectedUbicacionId],
  );

  const availableEstantes = selectedUbicacion?.ubicacioneAlmacen ?? [];

  const resetCreateEstanteForm = () => {
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
      if (ubicacionesResponse.status !== 200) {
        return;
      }

      const ubicacionesData =
        ubicacionesResponse.data?.data || ubicacionesResponse.data;
      if (!Array.isArray(ubicacionesData)) {
        return;
      }

      const ubicacionesMapeadas = mapUbicacionesFromResponse(ubicacionesData);
      setUbicaciones(ubicacionesMapeadas);

      const options: UbicacionAlmacenOption[] = [];
      ubicacionesMapeadas.forEach((ubicacion) => {
        (ubicacion.ubicacioneAlmacen || []).forEach((item) => {
          options.push({
            id: item.id,
            label: `${ubicacion.nombre || "Ubicación"} • ${item.codigo || "N/A"}`,
          });
        });
      });
      setUbicacionOptions(options);

      return ubicacionesMapeadas;
    } catch (error) {
      console.error("Error recargando ubicaciones:", error);
      return;
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
        const recargadas = await reloadUbicaciones();
        resetCreateEstanteForm();
        setShowCreateEstante(false);

        const createdId = response.data?.data?.id || response.data?.id;
        if (createdId) {
          setSelectedUbiAlmaId(String(createdId));
        } else if (recargadas) {
          const ubicacion = recargadas.find(
            (item) => String(item.id) === selectedUbicacionId,
          );
          const found = (ubicacion?.ubicacioneAlmacen || []).find(
            (item) => item.codigo === codigoFinal,
          );
          if (found) {
            setSelectedUbiAlmaId(String(found.id));
          }
        }
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

  const toggleFotoEliminar = (photoId: number) => {
    setFotosEliminar((prev) =>
      prev.includes(photoId)
        ? prev.filter((idValue) => idValue !== photoId)
        : [...prev, photoId],
    );
  };

  const pickImage = async (source: "camera" | "library") => {
    const permissions =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissions.granted) {
      showError("Permisos requeridos para seleccionar fotos");
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

    setNewImages((prev) => {
      const merged = [...prev, ...selectedFromPicker].filter(
        (file, index, arr) =>
          arr.findIndex((item) => item.uri === file.uri) === index,
      );

      if (merged.length > MAX_FILES) {
        showError(`Máximo ${MAX_FILES} imágenes nuevas por actualización`);
      }

      return merged.slice(0, MAX_FILES);
    });
  };

  const removeNewImage = (uri: string) => {
    setNewImages((prev) => prev.filter((image) => image.uri !== uri));
  };

  const normalize = (value: string) => value.trim();

  const handleSubmit = async () => {
    if (!currentVarianteId || !initialSnapshot || isSubmitting) {
      return;
    }

    if (selectedUbicacionId && !selectedUbiAlmaId) {
      showError(
        "Selecciona o crea una ubicación de almacén antes de actualizar",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        showError("No se encontró sesión activa");
        return;
      }

      const formData = new FormData();
      let changedFields = 0;

      const appendIfChanged = (key: keyof VariantSnapshot, current: string) => {
        const previous = initialSnapshot[key] ?? "";
        if (normalize(current) !== normalize(previous)) {
          formData.append(key, normalize(current));
          changedFields += 1;
        }
      };

      appendIfChanged("ubi_alma_id", selectedUbiAlmaId);
      appendIfChanged("nombre", nombre);
      appendIfChanged("codigo", codigo);
      appendIfChanged("color", color);
      appendIfChanged("descripcion", descripcion);
      appendIfChanged("cantidad", cantidad);
      appendIfChanged("precio_publico", precioPublico);
      appendIfChanged("precio_contratista", precioContratista);
      appendIfChanged("costo_compra", costoCompra);
      appendIfChanged("alto", alto);
      appendIfChanged("ancho", ancho);
      appendIfChanged("largo", largo);

      for (const image of newImages) {
        formData.append("foto", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      }

      for (const fotoId of fotosEliminar) {
        formData.append("fotosEliminar", String(fotoId));
      }

      if (
        changedFields === 0 &&
        newImages.length === 0 &&
        fotosEliminar.length === 0
      ) {
        showError("No hay cambios para actualizar");
        return;
      }

      const response = await fetch(
        `${baseUrl}/stock/productos/variantes/actualizar/${currentVarianteId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        showSuccess("Variante actualizada correctamente");
        router.back();
      } else {
        let errorText = "";
        try {
          const errorJson = await response.json();
          errorText =
            errorJson?.message || errorJson?.error || JSON.stringify(errorJson);
        } catch {
          errorText = await response.text();
        }

        showError(
          errorText ||
            "No se pudo actualizar la variante. Verifica los datos e intenta de nuevo",
        );
      }
    } catch (error) {
      console.error("Error actualizando variante:", error);
      showError("Error al actualizar la variante");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!productId || !currentVarianteId) {
    return (
      <ImageBackground
        source={require("@/assets/images/madera.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Center className="flex-1">
          <Text className="text-gray-400 text-base">Parámetros inválidos</Text>
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
              Actualizar variante
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Todos los campos son opcionales en update. Se enviarán solo
              cambios.
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
                  Ubicación y ubicación almacén
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Ubicación
                    </Text>
                    <Select
                      selectedValue={selectedUbicacionId}
                      onValueChange={(value) => {
                        setSelectedUbicacionId(value);
                        setSelectedUbiAlmaId("");
                        setShowCreateEstante(false);
                        resetCreateEstanteForm();
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
                        Ubicación almacén
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

                            <HStack space="md" className="items-start">
                              <Box className="flex-1">
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

                              <Box className="flex-1">
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
                            </HStack>

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
                        <Select
                          selectedValue={selectedUbiAlmaId}
                          onValueChange={setSelectedUbiAlmaId}
                          isDisabled={!selectedUbicacionId}
                        >
                          <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                            <SelectInput
                              placeholder={
                                selectedUbicacionId
                                  ? "Selecciona ubicación de almacén"
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
                                  availableEstantes.map((item) => (
                                    <SelectItem
                                      key={item.id}
                                      label={
                                        item.descripcion
                                          ? `${item.codigo} • ${item.descripcion}`
                                          : item.codigo
                                      }
                                      value={String(item.id)}
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
                  Datos de la variante
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Nombre</Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Nombre"
                        value={nombre}
                        onChangeText={setNombre}
                        className="text-white"
                      />
                    </Input>
                  </Box>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Código</Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Código"
                        value={codigo}
                        onChangeText={setCodigo}
                        className="text-white"
                      />
                    </Input>
                  </Box>

                  <HStack space="md" className="items-start">
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">Color</Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="Color"
                          value={color}
                          onChangeText={setColor}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">
                        Cantidad
                      </Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="Cantidad"
                          keyboardType="numeric"
                          value={cantidad}
                          onChangeText={setCantidad}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                  </HStack>

                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">
                      Descripción
                    </Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Descripción"
                        value={descripcion}
                        onChangeText={setDescripcion}
                        className="text-white"
                      />
                    </Input>
                  </Box>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Precios y dimensiones
                </Text>
                <VStack space="md">
                  <HStack space="md" className="items-start">
                    <Box className="flex-1">
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
                    <Box className="flex-1">
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
                  </HStack>

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

                  <HStack space="md" className="items-start">
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">Alto</Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="0"
                          keyboardType="numeric"
                          value={alto}
                          onChangeText={setAlto}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">Ancho</Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="0"
                          keyboardType="numeric"
                          value={ancho}
                          onChangeText={setAncho}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">Largo</Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="0"
                          keyboardType="numeric"
                          value={largo}
                          onChangeText={setLargo}
                          className="text-white"
                        />
                      </Input>
                    </Box>
                  </HStack>
                </VStack>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Fotos existentes
                </Text>

                {existingPhotos.length === 0 ? (
                  <Text className="text-gray-400 text-sm">
                    No hay fotos actuales.
                  </Text>
                ) : (
                  <HStack space="sm" className="flex-wrap">
                    {existingPhotos.map((photo) => {
                      const marked = fotosEliminar.includes(photo.id);
                      return (
                        <Pressable
                          key={photo.id}
                          onPress={() => toggleFotoEliminar(photo.id)}
                          className={`w-[31%] mb-2 p-1 rounded-lg border ${
                            marked
                              ? "border-red-500 bg-red-500/10"
                              : "border-[#169500]/40"
                          }`}
                        >
                          <Image
                            source={{ uri: photo.url }}
                            style={{
                              width: "100%",
                              height: 72,
                              borderRadius: 8,
                            }}
                          />
                          <Text className="text-xs text-center mt-1 text-gray-300">
                            {marked ? "Se eliminará" : `Foto #${photo.id}`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                )}

                {fotosEliminar.length > 0 && (
                  <Text className="text-red-400 text-xs mt-2">
                    Fotos marcadas para eliminar: {fotosEliminar.join(", ")}
                  </Text>
                )}

                <Text className="text-gray-500 text-xs mt-2">
                  Toca una foto para marcar/desmarcar eliminación.
                </Text>
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Subir nuevas fotos
                </Text>

                {newImages.length > 0 ? (
                  <VStack space="sm">
                    <HStack space="sm" className="flex-wrap">
                      {newImages.map((image, index) => (
                        <Box
                          key={image.uri}
                          className="w-[31%] border border-[#169500]/40 rounded-lg p-1"
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
                            onPress={() => removeNewImage(image.uri)}
                            className="mt-1 bg-secondary-700 border border-[#169500]/40 rounded-md px-2 py-1"
                          >
                            <Text className="text-gray-300 text-xs text-center">
                              Quitar #{index + 1}
                            </Text>
                          </Pressable>
                        </Box>
                      ))}
                    </HStack>
                    <Text className="text-gray-400 text-xs text-center">
                      {newImages.length} de {MAX_FILES} imágenes nuevas
                    </Text>
                  </VStack>
                ) : (
                  <Center className="border border-dashed border-[#169500]/40 rounded-2xl py-8">
                    <ImagePlus size={36} color="#13E000" strokeWidth={1.5} />
                    <Text className="text-gray-400 text-sm mt-2">
                      Agrega hasta 5 fotos nuevas (JPG, JPEG, PNG o WEBP)
                    </Text>
                  </Center>
                )}

                <HStack space="md" className="items-center mt-3">
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
              </Box>

              <Button
                size="lg"
                action="primary"
                className="bg-[#13E000] rounded-xl"
                onPress={handleSubmit}
                isDisabled={isSubmitting}
              >
                <ButtonText className="text-black font-semibold">
                  {isSubmitting ? "Actualizando..." : "Actualizar variante"}
                </ButtonText>
              </Button>
            </VStack>
          )}
        </Box>
      </ScrollView>
    </ImageBackground>
  );
}
