import { useMemo, useState } from "react";
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
import { ActivityIndicator, Pressable, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, Plus, Trash2 } from "lucide-react-native";
import { request } from "@/constants/Request";

type ExtraCost = {
  motivo: string;
  costo: string;
};

type Errors = {
  varianteId: string;
  cantidad: string;
  nombreCliente: string;
  contactoCliente: string;
  tipoVenta: string;
  costosExtras: string;
};

export default function NuevaVenta() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    varianteId?: string;
    precioPublico?: string;
    precioContratista?: string;
    nombreVariante?: string;
  }>();

  const varianteId = params.varianteId ? Number(params.varianteId) : NaN;
  const precioPublico = params.precioPublico ? Number(params.precioPublico) : 0;
  const precioContratista = params.precioContratista
    ? Number(params.precioContratista)
    : 0;

  const [cantidad, setCantidad] = useState("1");
  const [nombreCliente, setNombreCliente] = useState("");
  const [contactoCliente, setContactoCliente] = useState("");
  const [tipoVenta, setTipoVenta] = useState("publico");
  const [costosExtras, setCostosExtras] = useState<ExtraCost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<Errors>({
    varianteId: "",
    cantidad: "",
    nombreCliente: "",
    contactoCliente: "",
    tipoVenta: "",
    costosExtras: "",
  });

  const basePrice = useMemo(() => {
    if (tipoVenta === "contratista" && precioContratista > 0) {
      return precioContratista;
    }
    return precioPublico;
  }, [precioContratista, precioPublico, tipoVenta]);

  const cantidadNumber = useMemo(() => Number(cantidad || 0), [cantidad]);

  const extrasTotal = useMemo(() => {
    const total = costosExtras.reduce((acc, item) => {
      // Limpiar el string y convertir a número
      const costoStr = (item.costo || "").trim().replace(/[^\d.-]/g, "");
      const costo = parseFloat(costoStr) || 0;
      if (!Number.isNaN(costo) && costo > 0) {
        return acc + costo;
      }
      return acc;
    }, 0);
    return total;
  }, [costosExtras]);

  const totalVenta = useMemo(() => {
    const cantidad =
      Number.isNaN(cantidadNumber) || cantidadNumber <= 0 ? 0 : cantidadNumber;
    const total = basePrice * cantidad;
    return Math.max(0, total);
  }, [basePrice, cantidadNumber, extrasTotal]);

  const formatPrice = (price: number) => {
    return `$ ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)}`;
  };

  const handleAddExtra = () => {
    setCostosExtras((prev) => [...prev, { motivo: "", costo: "" }]);
  };

  const handleRemoveExtra = (index: number) => {
    setCostosExtras((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtraChange = (
    index: number,
    key: keyof ExtraCost,
    value: string,
  ) => {
    setCostosExtras((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  };

  const validateForm = () => {
    const newErrors: Errors = {
      varianteId: "",
      cantidad: "",
      nombreCliente: "",
      contactoCliente: "",
      tipoVenta: "",
      costosExtras: "",
    };

    if (!varianteId || Number.isNaN(varianteId)) {
      newErrors.varianteId = "Variante invalida";
    }

    if (!cantidad.trim()) {
      newErrors.cantidad = "Ingresa la cantidad";
    } else if (Number.isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    }

    if (!nombreCliente.trim()) {
      newErrors.nombreCliente = "Ingresa el nombre del cliente";
    }

    if (!contactoCliente.trim()) {
      newErrors.contactoCliente = "Ingresa el contacto del cliente";
    }

    if (!tipoVenta) {
      newErrors.tipoVenta = "Selecciona el tipo de venta";
    }

    const hasInvalidExtras = costosExtras.some((item) => {
      const hasMotivo = item.motivo.trim().length > 0;
      const hasCosto = item.costo.trim().length > 0;
      return (hasMotivo && !hasCosto) || (!hasMotivo && hasCosto);
    });

    if (hasInvalidExtras) {
      newErrors.costosExtras =
        "Completa motivo y costo en los extras o elimina el registro";
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
      const filteredExtras = costosExtras
        .filter((item) => item.motivo.trim() && item.costo.trim())
        .map((item) => ({
          motivo: item.motivo.trim(),
          costo: Number(item.costo),
        }));

      const payload = {
        varianteId,
        cantidad: Number(cantidad),
        nombre_cliente: nombreCliente.trim(),
        contacto_cliente: contactoCliente.trim(),
        tipo_venta: tipoVenta,
        total_venta: Number(totalVenta.toFixed(2)),
        ...(filteredExtras.length > 0 && { costos_extras: filteredExtras }),
      };

      const response = await request("/stock/ventas/crear", "POST", payload);

      if (response.status === 200 || response.status === 201) {
        router.back();
      }
    } catch (error) {
      console.error("Error creando venta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!varianteId || Number.isNaN(varianteId)) {
    return (
      <Box className="flex-1 bg-[#000000]">
        <Center className="flex-1">
          <Text className="text-gray-400 text-base">
            Variante invalida para registrar la venta.
          </Text>
        </Center>
      </Box>
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
            <Text className="text-white text-2xl font-bold">Nueva venta</Text>
            <Text className="text-gray-400 text-sm mt-1">
              {params.nombreVariante
                ? `Variante: ${params.nombreVariante}`
                : "Registra la venta de la variante seleccionada."}
            </Text>
          </Box>

          <VStack space="xl" className="mt-6">
            <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
              <Text className="text-white font-semibold text-lg mb-3">
                Datos de la venta
              </Text>
              <VStack space="md">
                <Box>
                  <Text className="text-gray-400 text-sm mb-2">Cantidad</Text>
                  <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                    <InputField
                      placeholder="Cantidad"
                      value={cantidad}
                      onChangeText={setCantidad}
                      keyboardType="numeric"
                      className="text-white"
                    />
                  </Input>
                  {errors.cantidad ? (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.cantidad}
                    </Text>
                  ) : null}
                </Box>

                <Box>
                  <Text className="text-gray-400 text-sm mb-2">
                    Nombre del cliente
                  </Text>
                  <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                    <InputField
                      placeholder="Nombre y apellido"
                      value={nombreCliente}
                      onChangeText={setNombreCliente}
                      className="text-white"
                    />
                  </Input>
                  {errors.nombreCliente ? (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.nombreCliente}
                    </Text>
                  ) : null}
                </Box>

                <Box>
                  <Text className="text-gray-400 text-sm mb-2">
                    Contacto del cliente
                  </Text>
                  <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                    <InputField
                      placeholder="Telefono o email"
                      value={contactoCliente}
                      onChangeText={setContactoCliente}
                      className="text-white"
                    />
                  </Input>
                  {errors.contactoCliente ? (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.contactoCliente}
                    </Text>
                  ) : null}
                </Box>

                <Box>
                  <Text className="text-gray-400 text-sm mb-2">
                    Tipo de venta
                  </Text>
                  <Select
                    selectedValue={tipoVenta}
                    onValueChange={setTipoVenta}
                  >
                    <SelectTrigger className="bg-secondary-600 border-[#169500] rounded-xl">
                      <SelectInput
                        placeholder="Selecciona un tipo"
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
                          <SelectItem label="Publico" value="publico" />
                          <SelectItem label="Contratista" value="contratista" />
                        </SelectScrollView>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  {errors.tipoVenta ? (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.tipoVenta}
                    </Text>
                  ) : null}
                </Box>

                <Box className="bg-secondary-600/70 rounded-xl p-3 border border-[#169500]">
                  <HStack space="sm" className="items-center justify-between">
                    <Text className="text-gray-300 text-sm">Precio base</Text>
                    <Text className="text-white font-semibold">
                      {formatPrice(basePrice)}
                    </Text>
                  </HStack>
                  <HStack
                    space="sm"
                    className="items-center justify-between mt-2"
                  >
                    <Text className="text-gray-300 text-sm">Total</Text>
                    <Text className="text-[#169500] font-bold text-lg">
                      {formatPrice(totalVenta)}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </Box>

            <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
              <HStack space="sm" className="items-center justify-between mb-3">
                <Text className="text-white font-semibold text-lg">
                  Costos extras
                </Text>
                <Button
                  size="sm"
                  action="primary"
                  className="bg-[#13E000] rounded-full px-3"
                  onPress={handleAddExtra}
                >
                  <ButtonIcon as={Plus} className="text-black" />
                  <ButtonText className="text-black font-semibold">
                    Agregar
                  </ButtonText>
                </Button>
              </HStack>

              {costosExtras.length === 0 ? (
                <Text className="text-gray-400 text-sm">
                  No hay costos extras registrados.
                </Text>
              ) : (
                <VStack space="md">
                  {costosExtras.map((item, index) => (
                    <Box
                      key={`extra-${index}`}
                      className="bg-secondary-600 rounded-xl p-3 border border-[#169500]"
                    >
                      <VStack space="sm">
                        <Box>
                          <Text className="text-gray-400 text-sm mb-2">
                            Motivo
                          </Text>
                          <Input className="bg-secondary-700 border-[#169500] rounded-xl">
                            <InputField
                              placeholder="Envio, empaque..."
                              value={item.motivo}
                              onChangeText={(value) =>
                                handleExtraChange(index, "motivo", value)
                              }
                              className="text-white"
                            />
                          </Input>
                        </Box>
                        <Box>
                          <Text className="text-gray-400 text-sm mb-2">
                            Costo
                          </Text>
                          <Input className="bg-secondary-700 border-[#169500] rounded-xl">
                            <InputField
                              placeholder="0.00"
                              value={item.costo}
                              onChangeText={(value) =>
                                handleExtraChange(index, "costo", value)
                              }
                              keyboardType="numeric"
                              className="text-white"
                            />
                          </Input>
                        </Box>
                        <Button
                          size="sm"
                          action="secondary"
                          className="bg-secondary-700 rounded-full border border-[#169500]"
                          onPress={() => handleRemoveExtra(index)}
                        >
                          <ButtonIcon as={Trash2} className="text-gray-300" />
                          <ButtonText className="text-gray-200 font-semibold">
                            Eliminar
                          </ButtonText>
                        </Button>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              )}

              {errors.costosExtras ? (
                <Text className="text-red-500 text-sm mt-3">
                  {errors.costosExtras}
                </Text>
              ) : null}
            </Box>

            <Button
              size="lg"
              action="primary"
              className="bg-[#13E000] rounded-2xl"
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <HStack space="sm" className="items-center">
                  <ActivityIndicator size="small" color="#000000" />
                  <ButtonText className="text-black font-semibold">
                    Registrando...
                  </ButtonText>
                </HStack>
              ) : (
                <ButtonText className="text-black font-semibold">
                  Registrar venta
                </ButtonText>
              )}
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </ImageBackground>
  );
}
