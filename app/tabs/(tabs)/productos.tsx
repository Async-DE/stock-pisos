import React, { useState, useMemo } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { FormControl, FormControlLabel, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
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
import { Image } from '@/components/ui/image';
import { ChevronDownIcon } from '@/components/ui/icon';
import { Pressable, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface Establecimiento {
  id: string;
  nombre: string;
  calle: string;
  cp: string;
  colonia: string;
  celular: string;
}

interface Estante {
  id: string;
  establecimientoId: string;
  establecimientoNombre: string;
  seccion: string;
  nivel: number;
  codigo: string;
}

interface Producto {
  id: string;
  foto: string | null;
  nombre: string;
  tipo: string;
  cantidad: number;
  precioVenta: number;
  costoCompra: number;
  ganancia: number;
  establecimientoId: string;
  establecimientoNombre: string;
  estanteId: string;
  estanteCodigo: string;
  codigo: string;
  fechaCreacion: string;
}

export default function Productos() {
  // En una app real, esto vendría de un contexto o estado global
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

  const [productos, setProductos] = useState<Producto[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    foto: null as string | null,
    nombre: '',
    tipo: '',
    cantidad: '',
    precioVenta: '',
    costoCompra: '',
    establecimientoId: '',
    estanteId: '',
  });

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

  // Filtrar estantes por establecimiento seleccionado
  const estantesFiltrados = useMemo(() => {
    if (!formData.establecimientoId) return [];
    return estantes.filter((e) => e.establecimientoId === formData.establecimientoId);
  }, [formData.establecimientoId, estantes]);

  // Calcular ganancia automáticamente
  const ganancia = useMemo(() => {
    const venta = parseFloat(formData.precioVenta) || 0;
    const costo = parseFloat(formData.costoCompra) || 0;
    return venta - costo;
  }, [formData.precioVenta, formData.costoCompra]);

  // Generar código automáticamente
  const codigoGenerado = useMemo(() => {
    if (!formData.estanteId) return '';
    const estante = estantes.find((e) => e.id === formData.estanteId);
    if (!estante) return '';

    const ahora = new Date();
    const fecha = ahora.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    return `${fecha}-${estante.codigo}`;
  }, [formData.estanteId, estantes]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
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

  const handleSelectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Seleccionar Imagen',
      '¿Cómo desea agregar la foto?',
      [
        {
          text: 'Tomar Foto',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setFormData({ ...formData, foto: result.assets[0].uri });
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
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

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

  const validateForm = () => {
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

    if (!formData.foto) {
      newErrors.foto = 'Por favor, agregue una foto del producto';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Por favor, escriba el nombre del producto';
    }

    if (!formData.tipo.trim()) {
      newErrors.tipo = 'Por favor, escriba el tipo de producto';
    }

    if (!formData.cantidad.trim()) {
      newErrors.cantidad = 'Por favor, ingrese cuántas unidades hay';
    } else {
      const cantidad = parseInt(formData.cantidad);
      if (isNaN(cantidad) || cantidad < 1) {
        newErrors.cantidad = 'Por favor, ingrese cuántas unidades hay (mínimo 1)';
      }
    }

    if (!formData.precioVenta.trim()) {
      newErrors.precioVenta = 'Por favor, ingrese el precio de venta';
    } else {
      const precio = parseFloat(formData.precioVenta);
      if (isNaN(precio) || precio < 0) {
        newErrors.precioVenta = 'Por favor, ingrese un precio válido (solo números)';
      }
    }

    if (!formData.costoCompra.trim()) {
      newErrors.costoCompra = 'Por favor, ingrese el costo de compra';
    } else {
      const costo = parseFloat(formData.costoCompra);
      if (isNaN(costo) || costo < 0) {
        newErrors.costoCompra = 'Por favor, ingrese un costo válido (solo números)';
      }
    }

    if (!formData.establecimientoId) {
      newErrors.establecimientoId = 'Por favor, elija un almacén de la lista';
    }

    if (!formData.estanteId) {
      newErrors.estanteId = 'Por favor, elija un lugar de guardado';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const establecimiento = establecimientos.find(
        (e) => e.id === formData.establecimientoId
      );
      const estante = estantes.find((e) => e.id === formData.estanteId);

      if (!establecimiento || !estante) return;

      const ahora = new Date();
      const fechaCreacion = ahora.toISOString().slice(0, 10); // YYYY-MM-DD

      const nuevoProducto: Producto = {
        id: Date.now().toString(),
        foto: formData.foto,
        nombre: formData.nombre.trim(),
        tipo: formData.tipo.trim(),
        cantidad: parseInt(formData.cantidad),
        precioVenta: parseFloat(formData.precioVenta),
        costoCompra: parseFloat(formData.costoCompra),
        ganancia: ganancia,
        establecimientoId: establecimiento.id,
        establecimientoNombre: establecimiento.nombre,
        estanteId: estante.id,
        estanteCodigo: estante.codigo,
        codigo: codigoGenerado,
        fechaCreacion: fechaCreacion,
      };

      setProductos([...productos, nuevoProducto]);
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
      setShowForm(false);
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
      
      // Mostrar confirmación de éxito
      Alert.alert(
        '✅ ¡Producto Guardado!',
        'El producto se ha guardado correctamente en su lista.',
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
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

  // Agrupar productos por establecimiento
  const productosPorEstablecimiento = productos.reduce((acc, producto) => {
    if (!acc[producto.establecimientoId]) {
      acc[producto.establecimientoId] = {
        establecimiento: establecimientos.find((e) => e.id === producto.establecimientoId),
        productos: [],
      };
    }
    acc[producto.establecimientoId].productos.push(producto);
    return acc;
  }, {} as Record<string, { establecimiento?: Establecimiento; productos: Producto[] }>);

  return (
    <Box className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <Box className="p-6">
          <Heading className="font-bold text-4xl mb-8 text-gray-900">
            Mis Productos
          </Heading>

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
            <>
              <Box className="mb-8">
                <Button
                  size="xl"
                  action="primary"
                  onPress={() => setShowForm(true)}
                  className="bg-blue-600 py-5 rounded-2xl"
                >
                  <ButtonText className="text-2xl font-bold">
                    ➕ Agregar Producto Nuevo
                  </ButtonText>
                </Button>
              </Box>

              {/* Lista de Productos */}
              {productos.length === 0 ? (
                <Box className="mt-8 items-center bg-white p-10 rounded-2xl border-3 border-gray-300">
                  <Text className="text-3xl mb-4">📦</Text>
                  <Text className="text-2xl text-gray-800 text-center font-semibold mb-3">
                    Aún no tiene productos registrados
                  </Text>
                  <Text className="text-xl text-gray-600 text-center">
                    Toque el botón de arriba para agregar su primer producto
                  </Text>
                </Box>
              ) : (
                <VStack space="xl">
                  {Object.values(productosPorEstablecimiento).map((grupo) => (
                    <Box key={grupo.establecimiento?.id} className="mb-8">
                      <Box className="bg-blue-100 p-5 rounded-t-2xl border-3 border-blue-400">
                        <Text className="text-3xl font-bold text-blue-900">
                          🏢 {grupo.establecimiento?.nombre}
                        </Text>
                      </Box>

                      <VStack space="lg" className="bg-white border-3 border-blue-400 border-t-0 rounded-b-2xl p-6">
                        {grupo.productos.map((producto) => (
                          <Box
                            key={producto.id}
                            className="bg-gray-50 border-3 border-gray-400 p-6 rounded-2xl"
                          >
                            <VStack space="md">
                              {/* Imagen y Nombre */}
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

                              {/* Información de Precios */}
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

                              {/* Ubicación */}
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
            <Box className="bg-white p-8 rounded-2xl border-3 border-gray-400 shadow-lg">
              <Heading className="font-bold text-4xl mb-4 text-gray-900">
                Agregar Producto Nuevo
              </Heading>
              <Text className="text-xl text-gray-700 mb-8 font-semibold">
                Complete la información paso a paso. Todos los campos marcados con * son obligatorios.
              </Text>

              <VStack space="xl">
                {/* Paso 1: Foto */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 1: Foto del Producto
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Agregue una foto para identificar fácilmente el producto
                  </Text>
                </Box>

                <FormControl isInvalid={!!errors.foto}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      📷 Foto del Producto *
                    </Text>
                  </FormControlLabel>
                  <Pressable onPress={handleSelectImage}>
                    <Box
                      className={`border-3 rounded-2xl p-6 items-center justify-center ${
                        errors.foto
                          ? 'border-red-600 bg-red-100'
                          : formData.foto
                          ? 'border-green-600 bg-green-100'
                          : 'border-gray-500 bg-gray-100'
                      }`}
                      style={{ minHeight: 240 }}
                    >
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

                {/* Paso 2: Información Básica */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 2: Información Básica
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Escriba el nombre, tipo y cantidad del producto
                  </Text>
                </Box>

                {/* Nombre */}
                <FormControl isInvalid={!!errors.nombre}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Cómo se llama este producto? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.nombre ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: Laptop HP 15, Camisa Azul, Arroz 1kg"
                      value={formData.nombre}
                      onChangeText={(text) => {
                        setFormData({ ...formData, nombre: text });
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

                {/* Tipo */}
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

                {/* Cantidad */}
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
                        setFormData({
                          ...formData,
                          cantidad: text.replace(/\D/g, ''),
                        });
                        if (errors.cantidad) {
                          setErrors({ ...errors, cantidad: '' });
                        }
                      }}
                      keyboardType="numeric"
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

                {/* Paso 3: Precios */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 3: Precios
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Indique cuánto cuesta y a cuánto lo vende
                  </Text>
                </Box>

                {/* Precio de Venta */}
                <FormControl isInvalid={!!errors.precioVenta}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
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

                {/* Costo de Compra */}
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

                {/* Ganancia (Auto-generada) */}
                <Box className="bg-green-50 border-3 border-green-500 p-6 rounded-2xl">
                  <Text className="text-2xl font-bold text-green-900 mb-3">
                    💵 Ganancia Calculada Automáticamente
                  </Text>
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
                  {ganancia < 0 && (
                    <Text className="text-xl font-semibold text-red-700 mt-2">
                      ⚠️ Advertencia: La ganancia es negativa
                    </Text>
                  )}
                </Box>

                {/* Paso 4: Ubicación */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 4: Ubicación
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Indique dónde está guardado el producto
                  </Text>
                </Box>

                {/* Establecimiento */}
                <FormControl isInvalid={!!errors.establecimientoId}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿En qué almacén está guardado? *
                    </Text>
                  </FormControlLabel>
                  <Select
                    selectedValue={formData.establecimientoId}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        establecimientoId: value,
                        estanteId: '', // Reset estante al cambiar establecimiento
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

                {/* Estante */}
                <FormControl isInvalid={!!errors.estanteId}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿En qué lugar del almacén está guardado? *
                    </Text>
                  </FormControlLabel>
                  <Select
                    selectedValue={formData.estanteId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, estanteId: value });
                      if (errors.estanteId) {
                        setErrors({ ...errors, estanteId: '' });
                      }
                    }}
                    isDisabled={!formData.establecimientoId}
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

                {/* Código (Auto-generado) */}
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

                {/* Botones */}
                <VStack space="lg" className="mt-8">
                  <Button
                    size="xl"
                    action="primary"
                    onPress={handleSubmit}
                    className="bg-green-600 py-6 rounded-2xl"
                  >
                    <ButtonText className="text-2xl font-bold">
                      ✅ Guardar Producto
                    </ButtonText>
                  </Button>
                  <Button
                    size="xl"
                    action="secondary"
                    variant="outline"
                    onPress={handleCancel}
                    className="border-3 border-gray-500 py-6 rounded-2xl"
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
