// Importaciones de React y hooks
import React, { useState, useMemo } from 'react';

// Importación de componentes UI básicos
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { FormControl, FormControlLabel, FormControlError, FormControlErrorText } from '@/components/ui/form-control';

// Importación de componentes del selector desplegable
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
} from '@/components/ui/select';

// Importación de componente de imagen y iconos
import { Image } from '@/components/ui/image';
import { ChevronDownIcon } from '@/components/ui/icon';

// Importación de componentes nativos de React Native
import { Pressable, Alert, Platform } from 'react-native';

// Importación de librería para seleccionar y tomar fotos
import * as ImagePicker from 'expo-image-picker';

// Interface que define la estructura de un establecimiento/almacén
interface Establecimiento {
  id: string;
  nombre: string;
  calle: string;
  cp: string;
  colonia: string;
  celular: string;
}

// Interface que define la estructura de un estante/lugar de guardado
interface Estante {
  id: string;
  establecimientoId: string;
  establecimientoNombre: string;
  seccion: string;
  nivel: number;
  codigo: string;
}

// Interface que define la estructura completa de un producto
interface Producto {
  id: string;                    // ID único del producto
  foto: string | null;           // URI de la foto del producto
  nombre: string;                // Nombre descriptivo del producto
  tipo: string;                  // Categoría o tipo (Electrónica, Ropa, etc.)
  cantidad: number;              // Cantidad en stock
  precioVenta: number;           // Precio al que se vende
  costoCompra: number;           // Costo de adquisición
  ganancia: number;              // Ganancia calculada (venta - costo) * cantidad
  establecimientoId: string;     // ID del almacén donde está guardado
  establecimientoNombre: string; // Nombre del almacén
  estanteId: string;             // ID del lugar de guardado
  estanteCodigo: string;         // Código del lugar (A-01, B-02, etc.)
  codigo: string;                // Código único del producto (fecha-estante)
  fechaCreacion: string;         // Fecha de registro en formato YYYY-MM-DD
}

export default function Productos() {
  // Estado que almacena la lista de almacenes disponibles
  // En una app real, esto vendría de un contexto o estado global compartido
  const [establecimientos] = useState<Establecimiento[]>([
    {
      id: '1',
      nombre: 'Almacén Central',
      calle: 'Av. Principal 123',
      cp: '12345',
      colonia: 'Centro',
      celular: '5551234567',
    },
  ]);

  // Estado que almacena la lista de lugares de guardado disponibles
  // En una app real, vendría de un contexto o estado global
  const [estantes] = useState<Estante[]>([
    {
      id: '1',
      establecimientoId: '1',
      establecimientoNombre: 'Almacén Central',
      seccion: 'A',
      nivel: 1,
      codigo: 'A-01',
    },
    {
      id: '2',
      establecimientoId: '1',
      establecimientoNombre: 'Almacén Central',
      seccion: 'A',
      nivel: 2,
      codigo: 'A-02',
    },
  ]);

  // Estado que almacena todos los productos registrados
  const [productos, setProductos] = useState<Producto[]>([]);

  // Estado que controla si se muestra el formulario de agregar producto
  const [showForm, setShowForm] = useState(false);
  
  // Estado que almacena los datos del formulario mientras el usuario los completa
  const [formData, setFormData] = useState({
    foto: null as string | null,  // URI de la foto tomada/seleccionada
    nombre: '',                   // Nombre del producto
    tipo: '',                     // Tipo/categoría del producto
    cantidad: '',                 // Cantidad en stock (como string para el input)
    precioVenta: '',              // Precio de venta (como string para el input)
    costoCompra: '',              // Costo de compra (como string para el input)
    establecimientoId: '',        // ID del almacén seleccionado
    estanteId: '',                // ID del lugar de guardado seleccionado
  });

  // Estado que almacena los mensajes de error de validación para cada campo
  const [errors, setErrors] = useState({
    foto: '',
    nombre: '',
    tipo: '',
    cantidad: '',
    precioVenta: '',
    costoCompra: '',
    establecimientoId: '',
    estanteId: '',
  });

  // Memo: Filtrar estantes por establecimiento seleccionado
  // Solo muestra los lugares de guardado que pertenecen al almacén elegido
  // Se recalcula automáticamente cuando cambia el establecimiento o la lista de estantes
  const estantesFiltrados = useMemo(() => {
    if (!formData.establecimientoId) return [];
    return estantes.filter((e) => e.establecimientoId === formData.establecimientoId);
  }, [formData.establecimientoId, estantes]);

  // Memo: Calcular ganancia automáticamente
  // Fórmula: (Precio Venta - Costo Compra) * Cantidad
  // Se recalcula cuando cambia cualquiera de estos valores
  const ganancia = useMemo(() => {
    const cantidad = parseInt(formData.cantidad) || 0;
    const venta = parseFloat(formData.precioVenta) || 0;
    const costo = parseFloat(formData.costoCompra) || 0;
    return (venta - costo) * cantidad;
  }, [formData.precioVenta, formData.costoCompra]);

  // Memo: Generar código único del producto automáticamente
  // Formato: YYMMDD-CODIGO_ESTANTE (ejemplo: 240204-A-01)
  // Se recalcula cuando cambia el lugar de guardado seleccionado
  const codigoGenerado = useMemo(() => {
    if (!formData.estanteId) return '';
    const estante = estantes.find((e) => e.id === formData.estanteId);
    if (!estante) return '';

    const ahora = new Date();
    const fecha = ahora.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    return `${fecha}-${estante.codigo}`;
  }, [formData.estanteId, estantes]);

  // Función que solicita permisos para usar la cámara y la galería
  // Solo se ejecuta en dispositivos móviles (no en web)
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      // Solicitar permisos de cámara y galería simultáneamente
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      // Si no se conceden los permisos, mostrar alerta y retornar false
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permisos Requeridos',
          'Se necesitan permisos para acceder a la cámara y galería.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  // Función que maneja la selección de imagen (cámara o galería)
  // Muestra un diálogo para que el usuario elija entre tomar foto o seleccionar de galería
  const handleSelectImage = async () => {
    // Primero verificar que tengamos los permisos necesarios
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Mostrar diálogo con opciones
    Alert.alert(
      'Seleccionar Imagen',
      '¿Cómo desea agregar la foto?',
      [
        {
          text: 'Tomar Foto',
          onPress: async () => {
            try {
              // Abrir la cámara para tomar una foto
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Solo imágenes
                allowsEditing: true,                              // Permitir recortar
                aspect: [4, 3],                                   // Relación de aspecto
                quality: 0.8,                                     // Calidad (0-1)
              });

              // Si el usuario tomó una foto y no canceló
              if (!result.canceled && result.assets[0]) {
                setFormData({ ...formData, foto: result.assets[0].uri });
                // Limpiar error si había uno
                if (errors.foto) {
                  setErrors({ ...errors, foto: '' });
                }
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo abrir la cámara');
            }
          },
        },
        {
          text: 'Elegir de Galería',
          onPress: async () => {
            try {
              // Abrir la galería para seleccionar una foto existente
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              // Si el usuario seleccionó una foto y no canceló
              if (!result.canceled && result.assets[0]) {
                setFormData({ ...formData, foto: result.assets[0].uri });
                if (errors.foto) {
                  setErrors({ ...errors, foto: '' });
                }
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo abrir la galería');
            }
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Función que valida todos los campos del formulario antes de guardar
  const validateForm = () => {
    // Objeto temporal para almacenar los errores de validación
    const newErrors = {
      foto: '',
      nombre: '',
      tipo: '',
      cantidad: '',
      precioVenta: '',
      costoCompra: '',
      establecimientoId: '',
      estanteId: '',
    };

    // Validar que se haya agregado una foto
    if (!formData.foto) {
      newErrors.foto = 'Por favor, agregue una foto del producto';
    }

    // Validar que el nombre no esté vacío
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Por favor, escriba el nombre del producto';
    }

    // Validar que el tipo no esté vacío
    if (!formData.tipo.trim()) {
      newErrors.tipo = 'Por favor, escriba el tipo de producto';
    }

    // Validar cantidad: debe ser un número mayor o igual a 1
    if (!formData.cantidad.trim()) {
      newErrors.cantidad = 'Por favor, ingrese cuántas unidades hay';
    } else {
      const cantidad = parseInt(formData.cantidad);
      if (isNaN(cantidad) || cantidad < 1) {
        newErrors.cantidad = 'Por favor, ingrese cuántas unidades hay (mínimo 1)';
      }
    }

    // Validar precio de venta: debe ser un número válido no negativo
    if (!formData.precioVenta.trim()) {
      newErrors.precioVenta = 'Por favor, ingrese el precio de venta';
    } else {
      const precio = parseFloat(formData.precioVenta);
      if (isNaN(precio) || precio < 0) {
        newErrors.precioVenta = 'Por favor, ingrese un precio válido (solo números)';
      }
    }

    // Validar costo de compra: debe ser un número válido no negativo
    if (!formData.costoCompra.trim()) {
      newErrors.costoCompra = 'Por favor, ingrese el costo de compra';
    } else {
      const costo = parseFloat(formData.costoCompra);
      if (isNaN(costo) || costo < 0) {
        newErrors.costoCompra = 'Por favor, ingrese un costo válido (solo números)';
      }
    }

    // Validar que se haya seleccionado un almacén
    if (!formData.establecimientoId) {
      newErrors.establecimientoId = 'Por favor, elija un almacén de la lista';
    }

    // Validar que se haya seleccionado un lugar de guardado
    if (!formData.estanteId) {
      newErrors.estanteId = 'Por favor, elija un lugar de guardado';
    }

    // Actualizar el estado de errores
    setErrors(newErrors);
    // Retornar true si no hay errores, false si hay al menos un error
    return !Object.values(newErrors).some((error) => error !== '');
  };

  // Función que se ejecuta al presionar el botón "Guardar Producto"
  const handleSubmit = () => {
    // Primero validar que todos los campos sean correctos
    if (validateForm()) {
      // Buscar el establecimiento y estante seleccionados en las listas
      const establecimiento = establecimientos.find(
        (e) => e.id === formData.establecimientoId
      );
      const estante = estantes.find((e) => e.id === formData.estanteId);

      // Si no se encuentran, salir (no debería pasar si la validación es correcta)
      if (!establecimiento || !estante) return;

      // Obtener la fecha actual en formato YYYY-MM-DD
      const ahora = new Date();
      const fechaCreacion = ahora.toISOString().slice(0, 10); // YYYY-MM-DD

      // Crear el objeto del nuevo producto con todos los datos
      const nuevoProducto: Producto = {
        id: Date.now().toString(),                    // ID único usando timestamp
        foto: formData.foto,                          // URI de la foto
        nombre: formData.nombre.trim(),               // Nombre sin espacios extra
        tipo: formData.tipo.trim(),                   // Tipo sin espacios extra
        cantidad: parseInt(formData.cantidad),        // Convertir a número
        precioVenta: parseFloat(formData.precioVenta), // Convertir a decimal
        costoCompra: parseFloat(formData.costoCompra), // Convertir a decimal
        ganancia: ganancia,                           // Ganancia calculada
        establecimientoId: establecimiento.id,        // ID del almacén
        establecimientoNombre: establecimiento.nombre, // Nombre del almacén
        estanteId: estante.id,                        // ID del lugar
        estanteCodigo: estante.codigo,                // Código del lugar (A-01)
        codigo: codigoGenerado,                       // Código único generado
        fechaCreacion: fechaCreacion,                 // Fecha de hoy
      };

      // Agregar el nuevo producto a la lista existente
      setProductos([...productos, nuevoProducto]);
      
      // Limpiar el formulario después de guardar
      setFormData({
        foto: null,
        nombre: '',
        tipo: '',
        cantidad: '',
        precioVenta: '',
        costoCompra: '',
        establecimientoId: '',
        estanteId: '',
      });
      
      // Ocultar el formulario y volver a la lista
      setShowForm(false);
      
      // Limpiar los mensajes de error
      setErrors({
        foto: '',
        nombre: '',
        tipo: '',
        cantidad: '',
        precioVenta: '',
        costoCompra: '',
        establecimientoId: '',
        estanteId: '',
      });
      
      // Mostrar confirmación de éxito al usuario
      Alert.alert(
        '✅ ¡Producto Guardado!',
        'El producto se ha guardado correctamente en su lista.',
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  // Función que se ejecuta al presionar el botón "Cancelar"
  const handleCancel = () => {
    // Ocultar el formulario
    setShowForm(false);
    
    // Limpiar todos los datos ingresados en el formulario
    setFormData({
      foto: null,
      nombre: '',
      tipo: '',
      cantidad: '',
      precioVenta: '',
      costoCompra: '',
      establecimientoId: '',
      estanteId: '',
    });
    
    // Limpiar los mensajes de error
    setErrors({
      foto: '',
      nombre: '',
      tipo: '',
      cantidad: '',
      precioVenta: '',
      costoCompra: '',
      establecimientoId: '',
      estanteId: '',
    });
  };

  // Función que agrupa los productos por establecimiento para mostrarlos organizados
  // Usa reduce para transformar el array de productos en un objeto agrupado por establecimientoId
  const productosPorEstablecimiento = productos.reduce((acc, producto) => {
    // Si este establecimiento no existe en el acumulador, crearlo
    if (!acc[producto.establecimientoId]) {
      acc[producto.establecimientoId] = {
        establecimiento: establecimientos.find((e) => e.id === producto.establecimientoId),
        productos: [],
      };
    }
    // Agregar este producto al grupo de su establecimiento
    acc[producto.establecimientoId].productos.push(producto);
    return acc;
  }, {} as Record<string, { establecimiento?: Establecimiento; productos: Producto[] }>);

  // Renderizado del componente
  return (
    <Box className="flex-1 bg-[#000000]">
      <ScrollView className="flex-1">
        <Box className="p-6">
          {/* Título principal de la pantalla */}
          <Heading className="font-bold text-4xl mb-8 text-[#B8860B]">
            Mis Productos
          </Heading>

          {/* Renderizado condicional con 3 casos: sin requisitos, lista de productos, o formulario */}
          {/* Caso 1: Si no hay almacenes o lugares de guardado, mostrar advertencia */}
          {establecimientos.length === 0 || estantes.length === 0 ? (
            <Box className="bg-yellow-50 border-3 border-yellow-400 p-8 rounded-2xl">
              <Text className="text-2xl text-yellow-900 text-center font-bold mb-3">
                ⚠️ Configuración Necesaria
              </Text>
              <Text className="text-xl text-yellow-800 text-center font-semibold mb-2">
                Primero debe crear almacenes y lugares de guardado
              </Text>
              <Text className="text-lg text-yellow-700 text-center">
                Vaya a las pestañas "Mis Almacenes" y "Lugares de Guardado" para crearlos
              </Text>
            </Box>
          ) : !showForm ? (
            // Caso 2: Mostrar lista de productos y botón para agregar nuevo
            <>
              {/* Botón para mostrar el formulario de agregar producto */}
              <Box className="mb-8">
                <Button
                  size="xl"
                  action="primary"
                  onPress={() => setShowForm(true)}
                  className="bg-[#FFD700] py-2 rounded-2xl"
                >
                  <ButtonText className="text-2xl font-bold text-black">
                    ➕ Agregar Producto Nuevo
                  </ButtonText>
                </Button>
              </Box>

              {/* Lista de Productos - Si no hay productos, mostrar mensaje de vacío */}
              {productos.length === 0 ? (
                <Box className="mt-8 items-center bg-[#1a1a1a] p-10 rounded-2xl border-3 border-[#FFD700]">
                  <Text className="text-3xl mb-4">📦</Text>
                  <Text className="text-2xl text-[#FFD700] text-center font-semibold mb-3">
                    Aún no tiene productos registrados
                  </Text>
                  <Text className="text-xl text-[#FFD700] text-center">
                    Toque el botón de arriba para agregar su primer producto
                  </Text>
                </Box>
              ) : (
                // Si hay productos, mostrarlos agrupados por almacén
                <VStack space="xl">
                  {/* Mapear cada grupo de establecimiento */}
                  {Object.values(productosPorEstablecimiento).map((grupo) => (
                    <Box key={grupo.establecimiento?.id} className="mb-8">
                      {/* Encabezado del almacén */}
                      <Box className="bg-blue-100 p-5 rounded-t-2xl border-3 border-blue-400">
                        <Text className="text-3xl font-bold text-blue-900">
                          🏢 {grupo.establecimiento?.nombre}
                        </Text>
                      </Box>

                      {/* Lista de productos de este almacén */}
                      <VStack space="lg" className="bg-white border-3 border-blue-400 border-t-0 rounded-b-2xl p-6">
                        {/* Mapear cada producto a una tarjeta */}
                        {grupo.productos.map((producto) => (
                          <Box
                            key={producto.id}
                            className="bg-gray-50 border-3 border-gray-400 p-6 rounded-2xl"
                          >
                            <VStack space="md">
                              {/* Sección: Imagen y Nombre del producto */}
                              <Box className="flex-row items-start">
                                {producto.foto && (
                                  <Box className="mr-4">
                                    <Image
                                      source={{ uri: producto.foto }}
                                      className="w-32 h-32 rounded-xl"
                                      alt={producto.nombre}
                                    />
                                  </Box>
                                )}
                                <Box className="flex-1">
                                  <Text className="text-xl font-bold text-gray-900 mb-1">
                                    📦 {producto.nombre}
                                  </Text>
                                  <Text className="text-lg text-gray-700">
                                    Tipo: {producto.tipo}
                                  </Text>
                                </Box>
                              </Box>

                              {/* Sección: Información de Precios y Ganancia */}
                              <Box className="bg-white p-4 rounded-xl border-2 border-gray-300">
                                <Box className="flex-row justify-between items-center mb-2">
                                  <Text className="text-lg font-semibold text-gray-700">
                                    💰 Precio:
                                  </Text>
                                  <Text className="text-2xl font-bold text-blue-600">
                                    ${producto.precioVenta.toFixed(2)}
                                  </Text>
                                </Box>
                                <Box className="flex-row justify-between items-center mb-2">
                                  <Text className="text-lg font-semibold text-gray-700">
                                    📊 Cantidad:
                                  </Text>
                                  <Text className="text-2xl font-bold text-gray-900">
                                    {producto.cantidad} unidades
                                  </Text>
                                </Box>
                                <Box className="flex-row justify-between items-center border-t-2 border-gray-300 pt-2">
                                  <Text className="text-lg font-semibold text-gray-700">
                                    💵 Ganancia:
                                  </Text>
                                  {/* Color dinámico: verde si hay ganancia, rojo si hay pérdida */}
                                  <Text
                                    className={`text-2xl font-bold ${
                                      producto.ganancia >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    ${producto.ganancia.toFixed(2)}
                                  </Text>
                                </Box>
                              </Box>

                              {/* Sección: Ubicación del producto (almacén y lugar) */}
                              <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300">
                                <Text className="text-lg font-semibold text-blue-900 mb-1">
                                  📍 Ubicación:
                                </Text>
                                <Text className="text-xl text-blue-800">
                                  Almacén: {grupo.establecimiento?.nombre}
                                </Text>
                                <Text className="text-xl text-blue-800">
                                  Lugar: {producto.estanteCodigo}
                                </Text>
                              </Box>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </>
          ) : (
            // Caso 3: Mostrar formulario para agregar nuevo producto
            <Box className="bg-[#1a1a1a] p-8 rounded-2xl border-3 border-[#FFD700] shadow-lg">
              <Heading className="font-bold text-4xl mb-4 text-[#FFD700]">
                Agregar Producto Nuevo
              </Heading>
              <Text className="text-xl text-[#FFD700] mb-8 font-semibold">
                Complete la información paso a paso. Todos los campos marcados con * son obligatorios.
              </Text>

              <VStack space="xl">
                {/* ====== Paso 1: Foto del Producto ====== */}
                {/* Encabezado del paso 1 */}
                <Box className="bg-[#2a2a2a] p-4 rounded-xl border-2 border-[#FFD700] mb-4">
                  <Text className="text-2xl font-bold text-[#FFD700] mb-1">
                    Paso 1: Foto del Producto
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Agregue una foto para identificar fácilmente el producto
                  </Text>
                </Box>

                {/* Campo: Foto del producto (cámara o galería) */}
                <FormControl isInvalid={!!errors.foto}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      📷 Foto del Producto *
                    </Text>
                  </FormControlLabel>
                  {/* Área presionable para seleccionar imagen */}
                  <Pressable onPress={handleSelectImage}>
                    {/* Caja con borde que cambia de color según el estado */}
                    <Box
                      className={`border-3 rounded-2xl p-6 items-center justify-center ${
                        errors.foto
                          ? 'border-red-600 bg-red-100'      // Rojo si hay error
                          : formData.foto
                          ? 'border-green-600 bg-green-100'  // Verde si hay foto
                          : 'border-gray-500 bg-gray-100'    // Gris si está vacío
                      }`}
                      style={{ minHeight: 240 }}
                    >
                      {/* Mostrar foto si ya se seleccionó, sino mostrar placeholder */}
                      {formData.foto ? (
                        <VStack space="md" className="items-center w-full">
                          <Image
                            source={{ uri: formData.foto }}
                            className="w-full h-56 rounded-xl"
                            alt="Producto"
                          />
                          <Text className="text-xl font-semibold text-green-800">
                            ✅ Foto agregada correctamente
                          </Text>
                          <Text className="text-lg text-green-700">
                            Toque aquí para cambiar la foto
                          </Text>
                        </VStack>
                      ) : (
                        <VStack space="md" className="items-center">
                          <Box className="w-24 h-24 bg-gray-500 rounded-full items-center justify-center">
                            <Text className="text-5xl">📷</Text>
                          </Box>
                          <Text className="text-2xl font-bold text-gray-700 text-center">
                            Toque aquí para tomar una foto
                          </Text>
                          <Text className="text-xl text-gray-600 text-center">
                            o elegir una foto de su galería
                          </Text>
                        </VStack>
                      )}
                    </Box>
                  </Pressable>
                  {errors.foto && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ {errors.foto}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* ====== Paso 2: Información Básica ====== */}
                {/* Encabezado del paso 2 */}
                <Box className="bg-[#2a2a2a] p-4 rounded-xl border-2 border-[#FFD700] mb-4">
                  <Text className="text-2xl font-bold text-[#FFD700] mb-1">
                    Paso 2: Información Básica
                  </Text>
                  <Text className="text-lg text-[#FFD700]">
                    Escriba el nombre, tipo y cantidad del producto
                  </Text>
                </Box>

                {/* Campo: Nombre del producto */}
                <FormControl isInvalid={!!errors.nombre}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿Cómo se llama este producto? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.nombre ? 'border-red-600' : 'border-[#FFD700]'
                    } bg-[#2a2a2a]`}
                  >
                    <InputField
                      placeholder="Ejemplo: Laptop HP 15, Camisa Azul, Arroz 1kg"
                      value={formData.nombre}
                      onChangeText={(text) => {
                        // Actualizar el valor del campo
                        setFormData({ ...formData, nombre: text });
                        // Si había un error, limpiarlo cuando el usuario empiece a escribir
                        if (errors.nombre) {
                          setErrors({ ...errors, nombre: '' });
                        }
                      }}
                      className="text-2xl py-4"
                    />
                  </Input>
                  {errors.nombre && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ Por favor, escriba el nombre del producto
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Campo: Tipo/Categoría del producto */}
                <FormControl isInvalid={!!errors.tipo}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Qué tipo de producto es? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.tipo ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: Electrónica, Ropa, Alimentos, Herramientas"
                      value={formData.tipo}
                      onChangeText={(text) => {
                        setFormData({ ...formData, tipo: text });
                        if (errors.tipo) {
                          setErrors({ ...errors, tipo: '' });
                        }
                      }}
                      className="text-2xl py-4"
                    />
                  </Input>
                  {errors.tipo && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ Por favor, escriba el tipo de producto
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Campo: Cantidad de unidades (solo acepta números) */}
                <FormControl isInvalid={!!errors.cantidad}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Cuántas unidades hay? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.cantidad ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: 10"
                      value={formData.cantidad}
                      onChangeText={(text) => {
                        // Eliminar cualquier carácter que no sea número
                        setFormData({
                          ...formData,
                          cantidad: text.replace(/\D/g, ''),
                        });
                        if (errors.cantidad) {
                          setErrors({ ...errors, cantidad: '' });
                        }
                      }}
                      keyboardType="numeric"  // Mostrar teclado numérico en móvil
                      className="text-2xl py-4 text-center"
                    />
                  </Input>
                  {errors.cantidad && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ Por favor, ingrese cuántas unidades hay (mínimo 1)
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* ====== Paso 3: Precios ====== */}
                {/* Encabezado del paso 3 */}
                <Box className="bg-[#2a2a2a] p-4 rounded-xl border-2 border-[#FFD700] mb-4">
                  <Text className="text-2xl font-bold text-[#FFD700] mb-1">
                    Paso 3: Precios
                  </Text>
                  <Text className="text-lg text-[#FFD700]">
                    Indique cuánto cuesta y a cuánto lo vende
                  </Text>
                </Box>

                {/* Campo: Precio de venta (acepta números y punto decimal) */}
                <FormControl isInvalid={!!errors.precioVenta}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿A cuánto lo vende? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.precioVenta ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: 1500.00"
                      value={formData.precioVenta}
                      onChangeText={(text) => {
                        // Permitir solo números y punto decimal
                        setFormData({
                          ...formData,
                          precioVenta: text.replace(/[^0-9.]/g, ''),
                        });
                        if (errors.precioVenta) {
                          setErrors({ ...errors, precioVenta: '' });
                        }
                      }}
                      keyboardType="decimal-pad"
                      className="text-2xl py-4 text-center"
                    />
                  </Input>
                  {errors.precioVenta && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ Por favor, ingrese el precio de venta
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Campo: Costo de compra (acepta números y punto decimal) */}
                <FormControl isInvalid={!!errors.costoCompra}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Cuánto le costó comprarlo? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.costoCompra ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: 1200.00"
                      value={formData.costoCompra}
                      onChangeText={(text) => {
                        setFormData({
                          ...formData,
                          costoCompra: text.replace(/[^0-9.]/g, ''),
                        });
                        if (errors.costoCompra) {
                          setErrors({ ...errors, costoCompra: '' });
                        }
                      }}
                      keyboardType="decimal-pad"
                      className="text-2xl py-4 text-center"
                    />
                  </Input>
                  {errors.costoCompra && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ Por favor, ingrese el costo de compra
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Visualización: Ganancia calculada automáticamente */}
                {/* Se calcula con el memo 'ganancia' definido arriba */}
                <Box className="bg-green-50 border-3 border-green-500 p-6 rounded-2xl">
                  <Text className="text-2xl font-bold text-green-900 mb-3">
                    💵 Ganancia Calculada Automáticamente
                  </Text>
                  {/* Color dinámico: verde si hay ganancia, rojo si hay pérdida */}
                  <Text
                    className={`text-4xl font-bold mb-2 ${
                      ganancia >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${ganancia.toFixed(2)}
                  </Text>
                  <Text className="text-xl text-green-800">
                    (Precio de Venta - Costo de Compra)
                  </Text>
                  {/* Advertencia si la ganancia es negativa */}
                  {ganancia < 0 && (
                    <Text className="text-xl font-semibold text-red-700 mt-2">
                      ⚠️ Advertencia: La ganancia es negativa
                    </Text>
                  )}
                </Box>

                {/* ====== Paso 4: Ubicación ====== */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 4: Ubicación
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Indique dónde está guardado el producto
                  </Text>
                </Box>

                {/* Campo: Selector de almacén (dropdown) */}
                <FormControl isInvalid={!!errors.establecimientoId}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿En qué almacén está guardado? *
                    </Text>
                  </FormControlLabel>
                  {/* Componente Select para mostrar un menú desplegable */}
                  <Select
                    selectedValue={formData.establecimientoId}
                    onValueChange={(value) => {
                      // Al cambiar el almacén, resetear el lugar de guardado
                      setFormData({
                        ...formData,
                        establecimientoId: value,
                        estanteId: '', // Importante: limpiar estante al cambiar almacén
                      });
                      if (errors.establecimientoId) {
                        setErrors({ ...errors, establecimientoId: '' });
                      }
                    }}
                  >
                    <SelectTrigger
                      variant="outline"
                      size="xl"
                      className={`rounded-2xl border-3 ${
                        errors.establecimientoId
                          ? 'border-red-600'
                          : 'border-gray-500'
                      }`}
                    >
                      <SelectInput
                        placeholder="Elija un almacén de la lista"
                        className="text-2xl py-4"
                      />
                      <SelectIcon className="mr-3">
                        <ChevronDownIcon />
                      </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectScrollView>
                          {establecimientos.map((establecimiento) => (
                            <SelectItem
                              key={establecimiento.id}
                              label={establecimiento.nombre}
                              value={establecimiento.id}
                            />
                          ))}
                        </SelectScrollView>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  {errors.establecimientoId && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ Por favor, elija un almacén de la lista
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Campo: Selector de lugar de guardado (dropdown dinámico) */}
                {/* Solo muestra lugares del almacén seleccionado */}
                <FormControl isInvalid={!!errors.estanteId}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿En qué lugar del almacén está guardado? *
                    </Text>
                  </FormControlLabel>
                  {/* Select deshabilitado hasta que se elija un almacén */}
                  <Select
                    selectedValue={formData.estanteId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, estanteId: value });
                      if (errors.estanteId) {
                        setErrors({ ...errors, estanteId: '' });
                      }
                    }}
                    isDisabled={!formData.establecimientoId}  // Deshabilitado si no hay almacén
                  >
                    <SelectTrigger
                      variant="outline"
                      size="xl"
                      className={`rounded-2xl border-3 ${
                        errors.estanteId
                          ? 'border-red-600'
                          : formData.establecimientoId
                          ? 'border-gray-500'
                          : 'border-gray-400 bg-gray-200'
                      }`}
                    >
                      <SelectInput
                        placeholder={
                          formData.establecimientoId
                            ? 'Elija un lugar de guardado'
                            : 'Primero elija un almacén arriba'
                        }
                        className="text-2xl py-4"
                      />
                      <SelectIcon className="mr-3">
                        <ChevronDownIcon />
                      </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectScrollView>
                          {/* Mostrar solo lugares del almacén seleccionado (filtrados) */}
                          {estantesFiltrados.map((estante) => (
                            <SelectItem
                              key={estante.id}
                              label={`${estante.codigo} (Sección ${estante.seccion})`}
                              value={estante.id}
                            />
                          ))}
                        </SelectScrollView>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  {errors.estanteId && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ Por favor, elija un lugar de guardado
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Visualización: Código único generado automáticamente */}
                {/* Solo se muestra cuando se ha seleccionado un lugar de guardado */}
                {codigoGenerado && (
                  <Box className="bg-green-50 border-3 border-green-500 p-6 rounded-2xl">
                    <Text className="text-2xl font-bold text-green-900 mb-3">
                      ✅ Número de Identificación (Generado automáticamente)
                    </Text>
                    <Text className="text-3xl font-mono font-bold text-green-900 mb-2">
                      {codigoGenerado}
                    </Text>
                    <Text className="text-lg text-green-800">
                      Este número se genera automáticamente para identificar el producto
                    </Text>
                  </Box>
                )}

                {/* ====== Botones de acción ====== */}
                <VStack space="lg" className="mt-8">
                  {/* Botón para guardar el producto (valida y guarda) */}
                  <Button
                    size="xl"
                    action="primary"
                    onPress={handleSubmit}
                    className="bg-[#FFD700] py-2 rounded-2xl"
                  >
                    <ButtonText className="text-2xl font-bold text-black">
                      ✅ Guardar Producto
                    </ButtonText>
                  </Button>
                  
                  {/* Botón para cancelar y volver a la lista (descarta cambios) */}
                  <Button
                    size="xl"
                    action="secondary"
                    variant="outline"
                    onPress={handleCancel}
                    className="border-3 border-[#FFD700] py-2 rounded-2xl bg-[#2a2a2a]"
                  >
                    <ButtonText className="text-2xl font-bold text-gray-700">
                      ❌ Cancelar
                    </ButtonText>
                  </Button>
                </VStack>
              </VStack>
            </Box>
          )}
        </Box>
      </ScrollView>
    </Box>
  );
}
