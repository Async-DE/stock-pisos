import { useMemo, useState } from "react";
import { ScrollView } from "@/components/ui/scroll-view";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { ActivityIndicator, Pressable, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, CalendarSearch, Search } from "lucide-react-native";
import { request } from "@/constants/Request";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type Variante = {
  nombre: string;
  codigo: string;
  color: string;
  medidas: string;
};

type CostoExtra = {
  id: number;
  venta_id: number;
  motivo: string;
  costo: number;
  createdAt: string;
};

type Venta = {
  id: number;
  variante_id: number;
  cantidad: number;
  total_venta: number;
  fecha_venta: string;
  nombre_cliente: string;
  contacto_cliente: string;
  precio_publico: number;
  precio_contratista: number;
  costo_compra: number;
  variante?: Variante;
  costosExtras?: CostoExtra[];
};

type Errors = {
  startDate: string;
  endDate: string;
  search: string;
};

export default function BuscarVentas() {
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateValue, setStartDateValue] = useState<Date | null>(null);
  const [endDateValue, setEndDateValue] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({
    startDate: "",
    endDate: "",
    search: "",
  });

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString("es-AR");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const resetErrors = () => {
    setErrors({ startDate: "", endDate: "", search: "" });
  };

  const formatDateInput = (value: Date | null) => {
    if (!value) {
      return "";
    }
    return value.toLocaleDateString("es-AR");
  };

  const openStartPicker = () => {
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    setShowEndPicker(true);
  };

  const handleConfirmStart = (date: Date) => {
    setStartDateValue(date);
    setStartDate(date.toISOString());
    setShowStartPicker(false);
  };

  const handleConfirmEnd = (date: Date) => {
    setEndDateValue(date);
    setEndDate(date.toISOString());
    setShowEndPicker(false);
  };

  const buildRangePayload = () => {
    if (!startDateValue || !endDateValue) {
      return null;
    }

    const start = new Date(startDateValue);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateValue);
    end.setHours(23, 59, 59, 999);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const handleSearchByRange = async () => {
    resetErrors();

    const newErrors: Errors = { startDate: "", endDate: "", search: "" };
    if (!startDateValue) {
      newErrors.startDate = "Selecciona la fecha de inicio";
    }
    if (!endDateValue) {
      newErrors.endDate = "Selecciona la fecha de fin";
    }

    if (newErrors.startDate || newErrors.endDate) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = buildRangePayload();

      if (!payload) {
        setErrors({
          startDate: "Selecciona la fecha de inicio",
          endDate: "Selecciona la fecha de fin",
          search: "",
        });
        return;
      }

      const response = await request("/stock/ventas/verRango", "POST", payload);

      if (response.status === 200 && Array.isArray(response.data)) {
        // Mapear la respuesta incluyendo todos los campos
        const ventasMapeadas = response.data.map((venta: any) => ({
          id: venta.id,
          variante_id: venta.variante_id,
          cantidad: venta.cantidad,
          total_venta: venta.total_venta || 0,
          fecha_venta: venta.fecha_venta,
          nombre_cliente: venta.nombre_cliente || "",
          contacto_cliente: venta.contacto_cliente || "",
          precio_publico: venta.precio_publico || 0,
          precio_contratista: venta.precio_contratista || 0,
          costo_compra: venta.costo_compra || 0,
          variante: venta.variante
            ? {
                nombre: venta.variante.nombre || "",
                codigo: venta.variante.codigo || "",
                color: venta.variante.color || "",
                medidas: venta.variante.medidas || "",
              }
            : undefined,
          costosExtras: Array.isArray(venta.costosExtras)
            ? venta.costosExtras.map((extra: any) => ({
                id: extra.id,
                venta_id: extra.venta_id,
                motivo: extra.motivo || "",
                costo: extra.costo || 0,
                createdAt: extra.createdAt || "",
              }))
            : [],
        }));
        setVentas(ventasMapeadas);
      } else {
        setVentas([]);
      }
    } catch (error) {
      console.error("Error buscando ventas por rango:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByParam = async () => {
    resetErrors();

    const newErrors: Errors = { startDate: "", endDate: "", search: "" };
    if (!searchTerm.trim()) {
      newErrors.search = "Ingresa un parametro de busqueda";
    }

    if (newErrors.search) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await request("/stock/ventas/verbuscar", "POST", {
        search: searchTerm.trim(),
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        // Mapear la respuesta incluyendo todos los campos
        const ventasMapeadas = response.data.map((venta: any) => ({
          id: venta.id,
          variante_id: venta.variante_id,
          cantidad: venta.cantidad,
          total_venta: venta.total_venta || 0,
          fecha_venta: venta.fecha_venta,
          nombre_cliente: venta.nombre_cliente || "",
          contacto_cliente: venta.contacto_cliente || "",
          precio_publico: venta.precio_publico || 0,
          precio_contratista: venta.precio_contratista || 0,
          costo_compra: venta.costo_compra || 0,
          variante: venta.variante
            ? {
                nombre: venta.variante.nombre || "",
                codigo: venta.variante.codigo || "",
                color: venta.variante.color || "",
                medidas: venta.variante.medidas || "",
              }
            : undefined,
          costosExtras: Array.isArray(venta.costosExtras)
            ? venta.costosExtras.map((extra: any) => ({
                id: extra.id,
                venta_id: extra.venta_id,
                motivo: extra.motivo || "",
                costo: extra.costo || 0,
                createdAt: extra.createdAt || "",
              }))
            : [],
        }));
        setVentas(ventasMapeadas);
      } else {
        setVentas([]);
      }
    } catch (error) {
      console.error("Error buscando ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalVentas = useMemo(() => {
    return ventas.reduce((acc, venta) => acc + (venta.total_venta || 0), 0);
  }, [ventas]);

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
            <Text className="text-white text-2xl font-bold">Buscar ventas</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Filtra por rango de fechas o por parametro.
            </Text>
          </Box>

          <VStack space="xl" className="mt-6">
            <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
              <HStack space="sm" className="items-center mb-3">
                <CalendarSearch size={18} color="#13E000" strokeWidth={2} />
                <Text className="text-white font-semibold text-lg">
                  Rango de fechas
                </Text>
              </HStack>

              <VStack space="md">
                <Box>
                  <Text className="text-gray-400 text-sm mb-2">
                    Fecha inicio
                  </Text>
                  <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                    <InputField
                      placeholder="Selecciona la fecha"
                      value={formatDateInput(startDateValue)}
                      editable={false}
                      showSoftInputOnFocus={false}
                      onPressIn={openStartPicker}
                      className="text-white"
                    />
                  </Input>
                  {errors.startDate ? (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.startDate}
                    </Text>
                  ) : null}
                </Box>

                <Box>
                  <Text className="text-gray-400 text-sm mb-2">Fecha fin</Text>
                  <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                    <InputField
                      placeholder="Selecciona la fecha"
                      value={formatDateInput(endDateValue)}
                      editable={false}
                      showSoftInputOnFocus={false}
                      onPressIn={openEndPicker}
                      className="text-white"
                    />
                  </Input>
                  {errors.endDate ? (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.endDate}
                    </Text>
                  ) : null}
                </Box>
                <DateTimePickerModal
                  isVisible={showStartPicker}
                  mode="date"
                  date={startDateValue ?? new Date()}
                  onConfirm={handleConfirmStart}
                  onCancel={() => setShowStartPicker(false)}
                />
                <DateTimePickerModal
                  isVisible={showEndPicker}
                  mode="date"
                  date={endDateValue ?? new Date()}
                  onConfirm={handleConfirmEnd}
                  onCancel={() => setShowEndPicker(false)}
                />

                <Button
                  size="md"
                  action="primary"
                  className="bg-[#13E000] rounded-full"
                  onPress={handleSearchByRange}
                  disabled={loading}
                >
                  <Search size={16} color="#000000" strokeWidth={2} />
                  <ButtonText className="text-black font-semibold">
                    Buscar por fechas
                  </ButtonText>
                </Button>
              </VStack>
            </Box>

            <Box className="bg-secondary-500/50 border border-[#169500] rounded-2xl p-4">
              <HStack space="sm" className="items-center mb-3">
                <Search size={18} color="#13E000" strokeWidth={2} />
                <Text className="text-white font-semibold text-lg">
                  Busqueda por parametro
                </Text>
              </HStack>

              <VStack space="md">
                <Box>
                  <Text className="text-gray-400 text-sm mb-2">
                    Parametro de busqueda
                  </Text>
                  <Input className="bg-secondary-600 border-[#169500] rounded-xl">
                    <InputField
                      placeholder="Cliente, contacto, variante..."
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                      className="text-white"
                    />
                  </Input>
                  {errors.search ? (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.search}
                    </Text>
                  ) : null}
                </Box>

                <Button
                  size="md"
                  action="primary"
                  className="bg-[#13E000] rounded-full"
                  onPress={handleSearchByParam}
                  disabled={loading}
                >
                  <Search size={16} color="#000000" strokeWidth={2} />
                  <ButtonText className="text-black font-semibold">
                    Buscar por parametro
                  </ButtonText>
                </Button>
              </VStack>
            </Box>

            <Box className="bg-secondary-500/30 border border-[#169500]/20 rounded-2xl p-4">
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-white font-semibold text-lg">
                  Resultados ({ventas.length})
                </Text>
                <Text className="text-[#169500] font-semibold">
                  {formatPrice(totalVentas)}
                </Text>
              </HStack>
            </Box>

            {loading ? (
              <Center className="py-10">
                <ActivityIndicator size="large" color="#13E000" />
                <Text className="text-gray-400 text-base mt-3">
                  Cargando ventas...
                </Text>
              </Center>
            ) : ventas.length === 0 ? (
              <Center className="py-10">
                <Text className="text-gray-400 text-base">
                  No hay ventas para mostrar.
                </Text>
              </Center>
            ) : (
              <VStack space="lg">
                {ventas.map((venta) => (
                  <Box
                    key={venta.id}
                    className="bg-secondary-600/70 border border-[#169500]/30 rounded-2xl p-4"
                  >
                    <HStack space="sm" className="items-center justify-between">
                      <Text className="text-white font-semibold text-lg">
                        Venta #{venta.id}
                      </Text>
                      <Text className="text-[#169500] font-bold">
                        {formatPrice(venta.total_venta)}
                      </Text>
                    </HStack>

                    <Text className="text-gray-400 text-sm mt-1">
                      {formatDate(venta.fecha_venta)}
                    </Text>

                    <VStack space="xs" className="mt-3">
                      <Text className="text-gray-300 text-sm">
                        Cliente: {venta.nombre_cliente}
                      </Text>
                      <Text className="text-gray-300 text-sm">
                        Contacto: {venta.contacto_cliente}
                      </Text>
                      <Text className="text-gray-300 text-sm">
                        Cantidad: {venta.cantidad} unidades
                      </Text>
                    </VStack>

                    {venta.variante && (
                      <Box className="mt-3 bg-secondary-700/60 rounded-xl p-3">
                        <Text className="text-gray-400 text-xs uppercase mb-2">
                          Información de la Variante
                        </Text>
                        <VStack space="xs">
                          <HStack
                            space="sm"
                            className="items-center justify-between"
                          >
                            <Text className="text-gray-300 text-sm">Nombre:</Text>
                            <Text className="text-white text-sm font-semibold">
                              {venta.variante.nombre}
                            </Text>
                          </HStack>
                          <HStack
                            space="sm"
                            className="items-center justify-between"
                          >
                            <Text className="text-gray-300 text-sm">Código:</Text>
                            <Text className="text-white text-sm font-semibold">
                              {venta.variante.codigo}
                            </Text>
                          </HStack>
                          <HStack
                            space="sm"
                            className="items-center justify-between"
                          >
                            <Text className="text-gray-300 text-sm">Color:</Text>
                            <Text className="text-white text-sm font-semibold">
                              {venta.variante.color}
                            </Text>
                          </HStack>
                          <HStack
                            space="sm"
                            className="items-center justify-between"
                          >
                            <Text className="text-gray-300 text-sm">Medidas:</Text>
                            <Text className="text-white text-sm font-semibold">
                              {venta.variante.medidas}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )}

                    <Box className="mt-3 bg-secondary-700/60 rounded-xl p-3">
                      <Text className="text-gray-400 text-xs uppercase mb-2">
                        Precios
                      </Text>
                      <HStack
                        space="sm"
                        className="items-center justify-between"
                      >
                        <Text className="text-gray-300 text-sm">Publico</Text>
                        <Text className="text-white text-sm font-semibold">
                          {formatPrice(venta.precio_publico || 0)}
                        </Text>
                      </HStack>
                      <HStack
                        space="sm"
                        className="items-center justify-between mt-1"
                      >
                        <Text className="text-gray-300 text-sm">
                          Contratista
                        </Text>
                        <Text className="text-white text-sm font-semibold">
                          {formatPrice(venta.precio_contratista || 0)}
                        </Text>
                      </HStack>
                      <HStack
                        space="sm"
                        className="items-center justify-between mt-1"
                      >
                        <Text className="text-gray-300 text-sm">
                          Costo compra
                        </Text>
                        <Text className="text-white text-sm font-semibold">
                          {formatPrice(venta.costo_compra || 0)}
                        </Text>
                      </HStack>
                    </Box>

                    <Box className="mt-3 bg-secondary-700/60 rounded-xl p-3">
                      <Text className="text-gray-400 text-xs uppercase mb-2">
                        Costos Extras
                      </Text>
                      {venta.costosExtras && venta.costosExtras.length > 0 ? (
                        <VStack space="xs">
                          {venta.costosExtras.map((extra) => (
                            <Box
                              key={extra.id}
                              className="bg-secondary-800/50 rounded-lg p-2"
                            >
                              <HStack
                                space="sm"
                                className="items-center justify-between"
                              >
                                <Text className="text-gray-300 text-sm font-medium">
                                  {extra.motivo}
                                </Text>
                                <Text className="text-[#13E000] text-sm font-bold">
                                  {formatPrice(extra.costo)}
                                </Text>
                              </HStack>
                            </Box>
                          ))}
                          <Box className="mt-2 pt-2 border-t border-gray-600">
                            <HStack
                              space="sm"
                              className="items-center justify-between"
                            >
                              <Text className="text-white text-sm font-semibold">
                                Total Costos Extras:
                              </Text>
                              <Text className="text-[#169500] text-sm font-bold">
                                {formatPrice(
                                  venta.costosExtras.reduce(
                                    (sum, extra) => sum + extra.costo,
                                    0,
                                  ),
                                )}
                              </Text>
                            </HStack>
                          </Box>
                        </VStack>
                      ) : (
                        <Text className="text-gray-500 text-sm">
                          Sin costos extras
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </VStack>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </ImageBackground>
  );
}
