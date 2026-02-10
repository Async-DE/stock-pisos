// Importaciones de React y hooks necesarios
import React, { useState } from 'react';

// Importación de componentes UI personalizados
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Center } from "@/components/ui/center";
import { Dimensions } from "react-native";
import { FormControl, FormControlLabel, FormControlError, FormControlErrorText } from '@/components/ui/form-control';

// Importación de componentes nativos de React Native
import { Alert, Image } from 'react-native';

// Interface que define la estructura de un establecimiento/almacén
interface Establecimiento {
  id: string;
  nombre: string;
  calle: string;
  cp: string;
  colonia: string;
  celular: string;
}

const { width: screenWidth } = Dimensions.get("window");

export default function Establecimientos() {
  // Estado que almacena la lista de todos los establecimientos registrados
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([
    // Datos de ejemplo para demostración inicial
    {
      id: '1',
      nombre: 'Almacén Central',
      calle: 'Av. Principal 123',
      cp: '12345',
      colonia: 'Centro',
      celular: '5551234567',
    },
  ]);

  // Estado que controla si se muestra el formulario de agregar nuevo establecimiento
  const [showForm, setShowForm] = useState(false);
  
  // Estado que almacena los datos del formulario mientras el usuario los completa
  const [formData, setFormData] = useState({
    nombre: '',
    calle: '',
    cp: '',
    colonia: '',
    celular: '',
  });

  // Estado que almacena los mensajes de error de validación para cada campo
  const [errors, setErrors] = useState({
    nombre: '',
    calle: '',
    cp: '',
    colonia: '',
    celular: '',
  });

  // Función que valida todos los campos del formulario antes de guardar
  const validateForm = () => {
    // Objeto temporal para almacenar los errores de validación
    const newErrors = {
      nombre: '',
      calle: '',
      cp: '',
      colonia: '',
      celular: '',
    };

    // Validar que el nombre no esté vacío
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Por favor, escriba el nombre del almacén';
    }

    // Validar que la calle no esté vacía
    if (!formData.calle.trim()) {
      newErrors.calle = 'Por favor, escriba la calle y número';
    }

    // Validar código postal: no vacío y exactamente 5 dígitos
    if (!formData.cp.trim()) {
      newErrors.cp = 'Por favor, ingrese el código postal';
    } else if (!/^\d{5}$/.test(formData.cp)) {
      newErrors.cp = 'El código postal debe tener exactamente 5 dígitos';
    }

    // Validar que la colonia no esté vacía
    if (!formData.colonia.trim()) {
      newErrors.colonia = 'Por favor, escriba la colonia';
    }

    // Validar número de celular: no vacío y exactamente 10 dígitos
    if (!formData.celular.trim()) {
      newErrors.celular = 'Por favor, ingrese el número de teléfono';
    } else if (!/^\d{10}$/.test(formData.celular.replace(/\D/g, ''))) {
      newErrors.celular = 'El número de teléfono debe tener 10 dígitos';
    }

    // Actualizar el estado de errores
    setErrors(newErrors);
    // Retornar true si no hay errores, false si hay al menos un error
    return !Object.values(newErrors).some((error) => error !== '');
  };

  // Función que se ejecuta al presionar el botón "Guardar Almacén"
  const handleSubmit = () => {
    // Primero validar que todos los campos sean correctos
    if (validateForm()) {
      // Crear un nuevo objeto establecimiento con los datos del formulario
      const newEstablecimiento: Establecimiento = {
        id: Date.now().toString(), // Usar timestamp como ID único
        nombre: formData.nombre.trim(), // Eliminar espacios al inicio y final
        calle: formData.calle.trim(),
        cp: formData.cp.trim(),
        colonia: formData.colonia.trim(),
        celular: formData.celular.replace(/\D/g, ''), // Eliminar cualquier carácter que no sea dígito
      };

      // Agregar el nuevo establecimiento a la lista existente
      setEstablecimientos([...establecimientos, newEstablecimiento]);
      
      // Limpiar el formulario después de guardar
      setFormData({
        nombre: '',
        calle: '',
        cp: '',
        colonia: '',
        celular: '',
      });
      
      // Ocultar el formulario y volver a la lista
      setShowForm(false);
      
      // Limpiar los mensajes de error
      setErrors({
        nombre: '',
        calle: '',
        cp: '',
        colonia: '',
        celular: '',
      });
      
      // Mostrar confirmación de éxito al usuario
      Alert.alert(
        '✅ ¡Almacén Creado!',
        'El almacén se ha guardado correctamente.',
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
      nombre: '',
      calle: '',
      cp: '',
      colonia: '',
      celular: '',
    });
    
    // Limpiar los mensajes de error
    setErrors({
      nombre: '',
      calle: '',
      cp: '',
      colonia: '',
      celular: '',
    });
  };

  // Renderizado del componente
  return (
    <>
      {/* Header con logo */}
      <Center className="mt-4 mb-4 rounded-lg mx-4">
        <Box className="rounded-full">
          <Image
            source={require("@/assets/images/Pisos-logo1.png")}
            style={{
              width: screenWidth < 375 ? 260 : 320,
              height: screenWidth < 375 ? 80 : 100,
              resizeMode: "contain",
            }}
          />
        </Box>
      </Center>

      <Box className="flex-1 bg-[#000000]">
        <ScrollView className="flex-1">
          <Box className="p-6">
            {/* Título y descripción */}
            <Box className="mb-6">
              <Heading size="lg" className="text-[#FFD700] mb-1">
                Gestión de almacenes
              </Heading>
              <Text className="text-gray-300 text-sm">
                Crea y administra las ubicaciones donde almacenas tus productos.
              </Text>
            </Box>

            {/* Contenido principal: formulario o menú */}
            {showForm ? (
              <Box className="bg-[#111111] rounded-2xl p-4 border border-[#333333]">
                <Heading size="md" className="text-[#FFD700] mb-4">
                  Nuevo almacén
                </Heading>

                <VStack space="md">
                  <FormControl isInvalid={!!errors.nombre}>
                    <Text className="text-sm text-gray-200 mb-1">
                      Nombre del almacén
                    </Text>
                    <Input variant="outline" size="md" className="border-[#FFD700]/40">
                      <InputField
                        value={formData.nombre}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, nombre: text }))
                        }
                        placeholder="Ej. Almacén Central"
                        className="text-sm text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                    </Input>
                    {errors.nombre ? (
                      <FormControlError>
                        <FormControlErrorText>{errors.nombre}</FormControlErrorText>
                      </FormControlError>
                    ) : null}
                  </FormControl>

                  <FormControl isInvalid={!!errors.calle}>
                    <Text className="text-sm text-gray-200 mb-1">
                      Calle y número
                    </Text>
                    <Input variant="outline" size="md" className="border-[#FFD700]/40">
                      <InputField
                        value={formData.calle}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, calle: text }))
                        }
                        placeholder="Ej. Av. Principal 123"
                        className="text-sm text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                    </Input>
                    {errors.calle ? (
                      <FormControlError>
                        <FormControlErrorText>{errors.calle}</FormControlErrorText>
                      </FormControlError>
                    ) : null}
                  </FormControl>

                  <FormControl isInvalid={!!errors.cp}>
                    <Text className="text-sm text-gray-200 mb-1">
                      Código postal
                    </Text>
                    <Input variant="outline" size="md" className="border-[#FFD700]/40">
                      <InputField
                        value={formData.cp}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, cp: text }))
                        }
                        placeholder="Ej. 12345"
                        keyboardType="number-pad"
                        className="text-sm text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                    </Input>
                    {errors.cp ? (
                      <FormControlError>
                        <FormControlErrorText>{errors.cp}</FormControlErrorText>
                      </FormControlError>
                    ) : null}
                  </FormControl>

                  <FormControl isInvalid={!!errors.colonia}>
                    <Text className="text-sm text-gray-200 mb-1">
                      Colonia
                    </Text>
                    <Input variant="outline" size="md" className="border-[#FFD700]/40">
                      <InputField
                        value={formData.colonia}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, colonia: text }))
                        }
                        placeholder="Ej. Centro"
                        className="text-sm text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                    </Input>
                    {errors.colonia ? (
                      <FormControlError>
                        <FormControlErrorText>{errors.colonia}</FormControlErrorText>
                      </FormControlError>
                    ) : null}
                  </FormControl>

                  <FormControl isInvalid={!!errors.celular}>
                    <Text className="text-sm text-gray-200 mb-1">
                      Teléfono de contacto
                    </Text>
                    <Input variant="outline" size="md" className="border-[#FFD700]/40">
                      <InputField
                        value={formData.celular}
                        onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, celular: text }))
                        }
                        placeholder="Ej. 5551234567"
                        keyboardType="phone-pad"
                        className="text-sm text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                    </Input>
                    {errors.celular ? (
                      <FormControlError>
                        <FormControlErrorText>{errors.celular}</FormControlErrorText>
                      </FormControlError>
                    ) : null}
                  </FormControl>

                  <Box className="flex-row justify-between mt-4">
                    <Button
                      size="md"
                      action="primary"
                      className="border border-gray-500 flex-1 mr-2"
                      onPress={handleCancel}
                    >
                      <ButtonText className="text-base text-gray-200">
                        Cancelar
                      </ButtonText>
                    </Button>
                    <Button
                      size="md"
                      action="primary"
                      className="bg-[#FFD700] flex-1 ml-2"
                      onPress={handleSubmit}
                    >
                      <ButtonText className="text-base font-bold text-black">
                        Guardar almacén
                      </ButtonText>
                    </Button>
                  </Box>
                </VStack>
              </Box>
            ) : (
              <>
                {/* Acciones principales */}
                <Box className="mb-6">
                  <VStack space="md">
                    <Button
                      size="xl"
                      variant="outline"
                      action="secondary"
                      className="border-3 border-[#FFD700] bg-[#1a1a1a] rounded-2xl"
                      onPress={() => setShowForm(true)}
                    >
                      <ButtonText className="text-xl font-bold text-[#FFD700] text-left w-full">
                        Crear nuevo almacén
                      </ButtonText>
                    </Button>

                    <Button
                      size="xl"
                      variant="outline"
                      action="secondary"
                      className="border-3 border-[#FFD700] bg-[#1a1a1a] rounded-2xl"
                      onPress={() => {}}
                    >
                      <ButtonText className="text-xl font-bold text-[#FFD700] text-left w-full">
                        Categorías
                      </ButtonText>
                    </Button>
                    <Button
                      size="xl"
                      variant="outline"
                      action="secondary"
                      className="border-3 border-[#FFD700] bg-[#1a1a1a] rounded-2xl"
                      onPress={() => {}}
                    >
                      <ButtonText className="text-xl font-bold text-[#FFD700] text-left w-full">
                        Subcategorías
                      </ButtonText>
                    </Button>
                    <Button
                      size="xl"
                      variant="outline"
                      action="secondary"
                      className="border-3 border-[#FFD700] bg-[#1a1a1a] rounded-2xl"
                      onPress={() => {}}
                    >
                      <ButtonText className="text-xl font-bold text-[#FFD700] text-left w-full">
                        Productos
                      </ButtonText>
                    </Button>
                    <Button
                      size="xl"
                      variant="outline"
                      action="secondary"
                      className="border-3 border-[#FFD700] bg-[#1a1a1a] rounded-2xl"
                      onPress={() => {}}
                    >
                      <ButtonText className="text-xl font-bold text-[#FFD700] text-left w-full">
                        Estantes
                      </ButtonText>
                    </Button>
                  </VStack>
                </Box>
              </>
            )}
          </Box>
        </ScrollView>
      </Box>
    </>
  );
}

