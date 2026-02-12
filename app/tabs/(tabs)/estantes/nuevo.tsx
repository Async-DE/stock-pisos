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
import { ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { request } from "@/constants/Request";

type Ubicacion = {
  id: number;
  nombre: string;
};

export default function NuevoEstante() {
  const router = useRouter();
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ubicacionId, setUbicacionId] = useState("");
  const [pasillo, setPasillo] = useState("");
  const [seccion, setSeccion] = useState("");
  const [niveles, setNiveles] = useState("");

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
        if (response.status === 200 && Array.isArray(response.data)) {
          setUbicaciones(response.data);
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
        router.back();
      }
    } catch (error) {
      console.error("Error creando estante:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="flex-1 bg-[#000000]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="px-4 pt-6 mt-10">
          <Pressable onPress={() => router.back()}>
            <HStack space="sm" className="items-center">
              <ArrowLeft size={22} color="#FFD700" strokeWidth={2} />
              <Text className="text-yellow-400 text-base font-semibold">
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
              <ActivityIndicator size="large" color="#FFD700" />
              <Text className="text-gray-400 text-base mt-3">
                Cargando ubicaciones...
              </Text>
            </Center>
          ) : (
            <VStack space="xl" className="mt-6">
              <Box className="bg-secondary-500/50 border border-yellow-400/30 rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Ubicacion
                </Text>
                <Select
                  selectedValue={ubicacionId}
                  onValueChange={setUbicacionId}
                >
                  <SelectTrigger className="bg-secondary-600 border-yellow-400/40 rounded-xl">
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

              <Box className="bg-secondary-500/50 border border-yellow-400/30 rounded-2xl p-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Detalles del estante
                </Text>
                <VStack space="md">
                  <Box>
                    <Text className="text-gray-400 text-sm mb-2">Seccion</Text>
                    <Input className="bg-secondary-600 border-yellow-400/40 rounded-xl">
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
                      <Input className="bg-secondary-600 border-yellow-400/40 rounded-xl">
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
                      <Input className="bg-secondary-600 border-yellow-400/40 rounded-xl">
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
                className="bg-[#FFD700] rounded-xl"
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
    </Box>
  );
}
