import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollView } from "@/components/ui/scroll-view";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { request } from "@/constants/Request";
import { usePermissions } from "@/contexts/PermissionsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError } from "@/utils/notifications";

type Usuario = {
  id: number;
  nombre: string;
  usuario: string;
  email_phone: string;
};

type Estante = {
  id: number;
  Seccion: string;
  pasillo: number;
  createdAt: string;
  ubicacionId: number;
};

type Variante = {
  id: number;
  nombre: string;
  codigo: string;
  color: string;
  medidas: string;
};

type Producto = {
  id: number;
  subcategoriaId: number;
  createdAt: string;
};

type Subcategoria = {
  id: number;
  nombre: string;
  ganancias_ventas: number;
  valor_stock: number;
  createdAt: string;
  categoriaId: number;
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
};

type Auditoria = {
  id: number;
  usuario_id: number;
  accion: string;
  estanteId?: number;
  productoId?: number;
  varianteId?: number;
  ventaId?: number;
  subcategoriaId?: number;
  createdAt: string;
  usuario: Usuario;
  estante?: Estante;
  producto?: Producto;
  variante?: Variante;
  venta?: Venta;
  subcategoria?: Subcategoria;
};

const ITEMS_PER_PAGE = 8;

export default function Auditorias() {
  const router = useRouter();
  const { canAccessAuditorias } = usePermissions();
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("user_permisos");
      if (!canAccessAuditorias && token && role) {
        showError("No tienes permisos para ver auditorías");
        router.replace("/tabs/(tabs)/almacenamientos");
      }
    };

    checkPermissions();
  }, [canAccessAuditorias, router]);

  const fetchAuditorias = useCallback(async (page: number = 0) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    const currentSkip = page * ITEMS_PER_PAGE;

    try {
      const response = await request(
        `/stock/auditoria/general?take=${ITEMS_PER_PAGE}&skip=${currentSkip}`,
        "GET",
      );

      // La respuesta del servidor es: { message: "...", data: [...] }
      const auditoriasData = response.data?.data || response.data;

      if (response.status === 200 && Array.isArray(auditoriasData)) {
        const auditoriasMapeadas = auditoriasData.map((audit: any) => ({
          id: audit.id,
          usuario_id: audit.usuario_id,
          accion: audit.accion || "",
          estanteId: audit.estanteId,
          productoId: audit.productoId,
          varianteId: audit.varianteId,
          ventaId: audit.ventaId,
          subcategoriaId: audit.subcategoriaId,
          createdAt: audit.createdAt,
          usuario: audit.usuario
            ? {
                id: audit.usuario.id,
                nombre: audit.usuario.nombre || "",
                usuario: audit.usuario.usuario || "",
                email_phone: audit.usuario.email_phone || "",
              }
            : ({} as Usuario),
          estante: audit.estante
            ? {
                id: audit.estante.id,
                Seccion: audit.estante.Seccion || "",
                pasillo: audit.estante.pasillo || 0,
                createdAt: audit.estante.createdAt,
                ubicacionId: audit.estante.ubicacionId,
              }
            : undefined,
          producto: audit.producto
            ? {
                id: audit.producto.id,
                subcategoriaId: audit.producto.subcategoriaId,
                createdAt: audit.producto.createdAt,
              }
            : undefined,
          variante: audit.variante
            ? {
                id: audit.variante.id,
                nombre: audit.variante.nombre || "",
                codigo: audit.variante.codigo || "",
                color: audit.variante.color || "",
                medidas: audit.variante.medidas || "",
              }
            : undefined,
          venta: audit.venta
            ? {
                id: audit.venta.id,
                variante_id: audit.venta.variante_id,
                cantidad: audit.venta.cantidad || 0,
                total_venta: audit.venta.total_venta || 0,
                fecha_venta: audit.venta.fecha_venta,
                nombre_cliente: audit.venta.nombre_cliente || "",
                contacto_cliente: audit.venta.contacto_cliente || "",
                precio_publico: audit.venta.precio_publico || 0,
                precio_contratista: audit.venta.precio_contratista || 0,
                costo_compra: audit.venta.costo_compra || 0,
              }
            : undefined,
          subcategoria: audit.subcategoria
            ? {
                id: audit.subcategoria.id,
                nombre: audit.subcategoria.nombre || "",
                ganancias_ventas: audit.subcategoria.ganancias_ventas || 0,
                valor_stock: audit.subcategoria.valor_stock || 0,
                createdAt: audit.subcategoria.createdAt,
                categoriaId: audit.subcategoria.categoriaId,
              }
            : undefined,
        }));

        setAuditorias(auditoriasMapeadas);

        // Si recibimos menos items que el take, no hay más páginas
        setHasMore(auditoriasMapeadas.length === ITEMS_PER_PAGE);
      } else {
        setAuditorias([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error cargando auditorías:", error);
      setAuditorias([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAuditorias(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Solo recargar si no hay datos
      if (auditorias.length === 0) {
        fetchAuditorias(0);
        setCurrentPage(0);
        setHasMore(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    await fetchAuditorias(0);
    setRefreshing(false);
  }, [fetchAuditorias]);

  const goToNextPage = useCallback(() => {
    if (isLoadingRef.current || !hasMore) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchAuditorias(nextPage);
  }, [currentPage, hasMore, fetchAuditorias]);

  const goToPreviousPage = useCallback(() => {
    if (isLoadingRef.current || currentPage === 0) return;

    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchAuditorias(prevPage);
  }, [currentPage, fetchAuditorias]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `$ ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)}`;
  };

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case "CREATE":
        return "#13E000";
      case "UPDATE":
        return "#169500";
      case "DELETE":
        return "#EF4444";
      case "VENTA":
        return "#3B82F6";
      case "LOGIN":
        return "#10B981";
      case "LOGOUT":
        return "#F59E0B";
      case "AJUSTE_STOCK":
        return "#8B5CF6";
      default:
        return "#9CA3AF";
    }
  };

  const renderAuditoria = (audit: Auditoria) => {
    return (
      <Box
        key={audit.id}
        className="bg-secondary-600/70 border border-[#169500]/30 rounded-2xl p-4 mb-4"
      >
        {/* Header */}
        <HStack space="sm" className="items-center justify-between mb-3">
          <HStack space="sm" className="items-center">
            <Box
              className="px-3 py-1 rounded-lg"
              style={{ backgroundColor: `${getAccionColor(audit.accion)}20` }}
            >
              <Text
                className="text-xs font-bold uppercase"
                style={{ color: getAccionColor(audit.accion) }}
              >
                {audit.accion}
              </Text>
            </Box>
            <Text className="text-gray-400 text-xs">ID: {audit.id}</Text>
          </HStack>
          <Text className="text-gray-400 text-xs">
            {formatDate(audit.createdAt)}
          </Text>
        </HStack>

        {/* Usuario */}
        <Box className="mb-3 bg-secondary-700/60 rounded-xl p-3">
          <Text className="text-gray-400 text-xs uppercase mb-2">Usuario</Text>
          <VStack space="xs">
            <HStack space="sm" className="items-center justify-between">
              <Text className="text-gray-300 text-sm">Nombre:</Text>
              <Text className="text-white text-sm font-semibold">
                {audit.usuario.nombre}
              </Text>
            </HStack>
            <HStack space="sm" className="items-center justify-between">
              <Text className="text-gray-300 text-sm">Usuario:</Text>
              <Text className="text-white text-sm font-semibold">
                {audit.usuario.usuario}
              </Text>
            </HStack>
            <HStack space="sm" className="items-center justify-between">
              <Text className="text-gray-300 text-sm">Contacto:</Text>
              <Text className="text-white text-sm font-semibold">
                {audit.usuario.email_phone}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Detalles según el tipo de acción */}
        {audit.accion === "CREATE" && audit.estante && (
          <Box className="mb-3 bg-secondary-700/60 rounded-xl p-3">
            <Text className="text-gray-400 text-xs uppercase mb-2">
              Estante Creado
            </Text>
            <VStack space="xs">
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">ID Estante:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.estante.id}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">Sección:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.estante.Seccion}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">Pasillo:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.estante.pasillo}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">Ubicación ID:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.estante.ubicacionId}
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {audit.accion === "CREATE" && audit.variante && audit.producto && (
          <Box className="mb-3 bg-secondary-700/60 rounded-xl p-3">
            <Text className="text-gray-400 text-xs uppercase mb-2">
              Variante Creada
            </Text>
            <VStack space="xs">
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">ID Producto:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.producto.id}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">ID Variante:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.variante.id}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">Nombre:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.variante.nombre}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">Código:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.variante.codigo}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">Color:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.variante.color}
                </Text>
              </HStack>
              <HStack space="sm" className="items-center justify-between">
                <Text className="text-gray-300 text-sm">Medidas:</Text>
                <Text className="text-white text-sm font-semibold">
                  {audit.variante.medidas}
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {(audit.accion === "LOGIN" || audit.accion === "LOGOUT") && (
          <Box className="mb-3 bg-secondary-700/60 rounded-xl p-3">
            <Text className="text-gray-400 text-xs uppercase mb-2">
              {audit.accion === "LOGIN" ? "Sesión Iniciada" : "Sesión Cerrada"}
            </Text>
            <Text className="text-gray-300 text-sm">
              El usuario {audit.usuario.nombre} ({audit.usuario.usuario}){" "}
              {audit.accion === "LOGIN" ? "inició sesión" : "cerró sesión"} en
              el sistema.
            </Text>
          </Box>
        )}

        {audit.accion === "AJUSTE_STOCK" && audit.variante && (
          <Box className="mb-3 bg-secondary-700/60 rounded-xl p-3">
            <Text className="text-gray-400 text-xs uppercase mb-2">
              Ajuste de Stock
            </Text>
            <VStack space="xs">
              {audit.varianteId && (
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">ID Variante:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.varianteId}
                  </Text>
                </HStack>
              )}
              {audit.variante && (
                <>
                  <HStack space="sm" className="items-center justify-between">
                    <Text className="text-gray-300 text-sm">Nombre:</Text>
                    <Text className="text-white text-sm font-semibold">
                      {audit.variante.nombre}
                    </Text>
                  </HStack>
                  <HStack space="sm" className="items-center justify-between">
                    <Text className="text-gray-300 text-sm">Código:</Text>
                    <Text className="text-white text-sm font-semibold">
                      {audit.variante.codigo}
                    </Text>
                  </HStack>
                </>
              )}
            </VStack>
          </Box>
        )}

        {(audit.accion === "UPDATE" || audit.accion === "DELETE") && (
          <Box className="mb-3 bg-secondary-700/60 rounded-xl p-3">
            <Text className="text-gray-400 text-xs uppercase mb-2">
              {audit.accion === "UPDATE"
                ? "Registro Actualizado"
                : "Registro Eliminado"}
            </Text>
            <VStack space="xs">
              {audit.estanteId && (
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">ID Estante:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.estanteId}
                  </Text>
                </HStack>
              )}
              {audit.productoId && (
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">ID Producto:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.productoId}
                  </Text>
                </HStack>
              )}
              {audit.varianteId && (
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">ID Variante:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.varianteId}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        )}

        {audit.accion === "VENTA" && audit.venta && audit.variante && (
          <>
            <Box className="mb-3 bg-secondary-700/60 rounded-xl p-3">
              <Text className="text-gray-400 text-xs uppercase mb-2">
                Información de Venta
              </Text>
              <VStack space="xs">
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">ID Venta:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.venta.id}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Cliente:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.venta.nombre_cliente}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Contacto:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.venta.contacto_cliente}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Cantidad:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.venta.cantidad} unidades
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Total Venta:</Text>
                  <Text className="text-[#13E000] text-sm font-bold">
                    {formatPrice(audit.venta.total_venta)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Box className="mb-3 bg-secondary-700/60 rounded-xl p-3">
              <Text className="text-gray-400 text-xs uppercase mb-2">
                Variante Vendida
              </Text>
              <VStack space="xs">
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Nombre:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.variante.nombre}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Código:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.variante.codigo}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Color:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.variante.color}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Medidas:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {audit.variante.medidas}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Box className="bg-secondary-700/60 rounded-xl p-3">
              <Text className="text-gray-400 text-xs uppercase mb-2">
                Precios
              </Text>
              <VStack space="xs">
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Precio Público:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {formatPrice(audit.venta.precio_publico)}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">
                    Precio Contratista:
                  </Text>
                  <Text className="text-white text-sm font-semibold">
                    {formatPrice(audit.venta.precio_contratista)}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center justify-between">
                  <Text className="text-gray-300 text-sm">Costo Compra:</Text>
                  <Text className="text-white text-sm font-semibold">
                    {formatPrice(audit.venta.costo_compra)}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </>
        )}
      </Box>
    );
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#13E000"
          />
        }
      >
        <Box className="px-4 pt-6 mt-10">
          <Pressable onPress={() => router.back()}>
            <HStack space="sm" className="items-center mb-4">
              <ArrowLeft size={22} color="#13E000" strokeWidth={2} />
              <Text className="text-[#169500] text-base font-semibold">
                Volver
              </Text>
            </HStack>
          </Pressable>

          <HStack space="sm" className="items-center mb-6">
            <History size={24} color="#13E000" strokeWidth={2} />
            <Text className="text-white text-2xl font-bold">Auditorías</Text>
          </HStack>

          {/* Botones de navegación al inicio */}
          <Box className="mb-4">
            <HStack space="md" className="items-center justify-between">
              <Button
                size="md"
                action="secondary"
                className="flex-1 bg-secondary-600 border border-[#169500] rounded-xl"
                onPress={goToPreviousPage}
                isDisabled={loading || currentPage === 0}
              >
                <ButtonIcon as={ChevronLeft} className="text-white" />
                <ButtonText className="text-white font-semibold">
                  Anterior
                </ButtonText>
              </Button>
              <Box className="px-4 py-2 bg-secondary-700 rounded-xl">
                <Text className="text-white font-semibold">
                  Página {currentPage + 1}
                </Text>
              </Box>
              <Button
                size="md"
                action="secondary"
                className="flex-1 bg-secondary-600 border border-[#169500] rounded-xl"
                onPress={goToNextPage}
                isDisabled={loading || !hasMore}
              >
                <ButtonText className="text-white font-semibold">
                  Siguiente
                </ButtonText>
                <ButtonIcon as={ChevronRight} className="text-white" />
              </Button>
            </HStack>
          </Box>

          {loading && auditorias.length === 0 ? (
            <Center className="py-12">
              <ActivityIndicator size="large" color="#13E000" />
              <Text className="text-gray-400 text-base mt-3">
                Cargando auditorías...
              </Text>
            </Center>
          ) : auditorias.length === 0 ? (
            <Center className="py-12">
              <Text className="text-gray-400 text-base">
                No hay auditorías para mostrar.
              </Text>
            </Center>
          ) : (
            <>
              <VStack space="md">{auditorias.map(renderAuditoria)}</VStack>

              {/* Botones de navegación al final */}
              <Box className="mt-6">
                <HStack space="md" className="items-center justify-between">
                  <Button
                    size="md"
                    action="secondary"
                    className="flex-1 bg-secondary-600 border border-[#169500] rounded-xl"
                    onPress={goToPreviousPage}
                    isDisabled={loading || currentPage === 0}
                  >
                    <ButtonIcon as={ChevronLeft} className="text-white" />
                    <ButtonText className="text-white font-semibold">
                      Anterior
                    </ButtonText>
                  </Button>
                  <Box className="px-4 py-2 bg-secondary-700 rounded-xl">
                    <Text className="text-white font-semibold">
                      Página {currentPage + 1}
                    </Text>
                  </Box>
                  <Button
                    size="md"
                    action="secondary"
                    className="flex-1 bg-secondary-600 border border-[#169500] rounded-xl"
                    onPress={goToNextPage}
                    isDisabled={loading || !hasMore}
                  >
                    <ButtonText className="text-white font-semibold">
                      Siguiente
                    </ButtonText>
                    <ButtonIcon as={ChevronRight} className="text-white" />
                  </Button>
                </HStack>
              </Box>

              {!hasMore && auditorias.length > 0 && (
                <Center className="mt-4">
                  <Text className="text-gray-500 text-sm">
                    No hay más páginas disponibles
                  </Text>
                </Center>
              )}
            </>
          )}
        </Box>
      </ScrollView>
    </ImageBackground>
  );
}
