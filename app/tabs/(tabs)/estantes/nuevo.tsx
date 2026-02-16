import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "@/components/ui/scroll-view";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
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
import { ActivityIndicator, Pressable, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { request } from "@/constants/Request";
import { usePermissions } from "@/contexts/PermissionsContext";
import { showError } from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Ubicacion = {
  id: number;
  nombre: string;
};

export default function NuevoEstante() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si no tiene permisos para crear
  useEffect(() => {
    const checkPermissions = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("user_permisos");
      // Solo mostrar error si hay token y rol (usuario autenticado) pero sin permisos
      // Si no hay token o rol es null, está cerrando sesión y no debemos mostrar error
      if (!canCreate && token && role) {
        showError("No tienes permisos para crear estantes");
        router.replace("/tabs/(tabs)/almacenamientos");
      }
    };
    checkPermissions();
  }, [canCreate, router]);

  const [ubicacionId, setUbicacionId] = useState("");
  const [pasillo, setPasillo] = useState("");
  const [seccion, setSeccion] = useState("");
  const [niveles, setNiveles] = useState("");
  const [formResetKey, setFormResetKey] = useState(0);

  const [errors, setErrors] = useState({
    ubicacionId: "",
    pasillo: "",
    seccion: "",
    niveles: "",
  });

  useEffect(() => {
    const fetchUbicaciones = async () => {
      setLoadingData(true);
      try {
        const response = await request("/stock/ubicaciones/ver", "GET");
        
        // La respuesta del servidor es: { message: "...", data: [...] }
        const ubicacionesData = response.data?.data || response.data;
        
        if (response.status === 200 && Array.isArray(ubicacionesData)) {
          // Mapear solo los campos necesarios (id y nombre)
          const ubicacionesMapeadas = ubicacionesData.map((ubicacion: any) => ({
            id: ubicacion.id,
            nombre: ubicacion.nombre || `Ubicación ${ubicacion.id}`,
          }));
          setUbicaciones(ubicacionesMapeadas);
        }
      } catch (error) {
        console.error("Error cargando ubicaciones:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUbicaciones();
  }, []);

  const selectedUbicacion = useMemo(
    () => ubicaciones.find((item) => String(item.id) === ubicacionId),
    [ubicaciones, ubicacionId],
  );

  const clearForm = () => {
    setUbicacionId("");
    setPasillo("");
    setSeccion("");
    setNiveles("");
    setErrors({
      ubicacionId: "",
      pasillo: "",
      seccion: "",
      niveles: "",
    });
    // Incrementar la key para forzar re-render del select
    setFormResetKey((prev) => prev + 1);
  };

  const handleBack = () => {
    clearForm();
    router.back();
  };

  const validateForm = () => {
    const newErrors = {
      ubicacionId: "",
      pasillo: "",
      seccion: "",
      niveles: "",
    };

    if (!ubicacionId) {
      newErrors.ubicacionId = "Selecciona una ubicacion";
    }

    if (!pasillo.trim()) {
      newErrors.pasillo = "Ingresa el pasillo";
    } else if (Number.isNaN(Number(pasillo))) {
      newErrors.pasillo = "El pasillo debe ser numerico";
    }

    if (!seccion.trim()) {
      newErrors.seccion = "Ingresa la seccion";
    }

    if (!niveles.trim()) {
      newErrors.niveles = "Ingresa los niveles";
    } else if (Number.isNaN(Number(niveles))) {
      newErrors.niveles = "Los niveles deben ser numericos";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        pasillo: Number(pasillo),
        seccion: seccion.trim(),
        niveles: Number(niveles),
        ubicacionId: Number(ubicacionId),
      };

      const response = await request("/stock/estantes/crear", "POST", payload);

      if (response.status === 200 || response.status === 201) {
        clearForm();
        router.back();
      }
    } catch (error) {
      console.error("Error creando estante:", error);
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
        <Box className="px-4 pt-6 mt-10">
          <Pressable onPress={handleBack}>
            <HStack space="sm" className="items-center">
              <ArrowLeft size={22} color="#13E000" strokeWidth={2} />
              <Text className="text-[#169500] text-base font-semibold">
                Volver
              </Text>
            </HStack>
          </Pressable>

          <Box className="mt-6">
            <Text className="text-white text-2xl font-bold">Nuevo estante</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Registra un estante y define sus niveles.
            </Text>
          </Box>

          {loadingData ? (
            <Center className="py-12">
              <ActivityIndicator size="large" color="#13E000" />
              <Text className="text-gray-400 text-base mt-3">
                Cargando ubicaciones...
              </Text>
            </Center>
          ) : (
            <VStack space="xl" className="mt-6">
              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Ubicacion
                </Text>
                <Select
                  key={`ubicacion-${formResetKey}`}
                  selectedValue={ubicacionId}
                  onValueChange={setUbicacionId}
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
                {errors.ubicacionId ? (
                  <Text className="text-red-500 text-sm mt-2">
                    {errors.ubicacionId}
                  </Text>
                ) : null}
                {selectedUbicacion ? (
                  <Text className="text-gray-500 text-xs mt-2">
                    {selectedUbicacion.nombre}
                  </Text>
                ) : null}
              </Box>

              <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Detalles del estante
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Seccion</Text>
                    <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                      <InputField
                        placeholder="Ej: A"
                        value={seccion}
                        onChangeText={setSeccion}
                        className="text-white"
                      />
                    </Input>
                    {errors.seccion ? (
                      <Text className="text-red-500 text-sm mt-2">
                        {errors.seccion}
                      </Text>
                    ) : null}
                  </Box>
                  <HStack space="md" className="items-start">
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">
                        Pasillo
                      </Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="Ej: 1"
                          keyboardType="numeric"
                          value={pasillo}
                          onChangeText={setPasillo}
                          className="text-white"
                        />
                      </Input>
                      {errors.pasillo ? (
                        <Text className="text-red-500 text-sm mt-2">
                          {errors.pasillo}
                        </Text>
                      ) : null}
                    </Box>
                    <Box className="flex-1">
                      <Text className="text-gray-400 text-sm mb-2">
                        Niveles
                      </Text>
                      <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                        <InputField
                          placeholder="Ej: 4"
                          keyboardType="numeric"
                          value={niveles}
                          onChangeText={setNiveles}
                          className="text-white"
                        />
                      </Input>
                      {errors.niveles ? (
                        <Text className="text-red-500 text-sm mt-2">
                          {errors.niveles}
                        </Text>
                      ) : null}
                    </Box>
                  </HStack>
                </VStack>
              </Box>

              <Button
                size="lg"
                action="primary"
                className="bg-[#13E000] rounded-xl"
                onPress={handleSubmit}
                isDisabled={isSubmitting}
              >
                <ButtonText className="text-black font-semibold">
                  {isSubmitting ? "Guardando..." : "Crear estante"}
                </ButtonText>
              </Button>
            </VStack>
          )}
        </Box>
      </ScrollView>
    </ImageBackground>
  );
}
