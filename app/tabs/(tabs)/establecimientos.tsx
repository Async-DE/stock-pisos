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
import { FormControl, FormControlLabel, FormControlError, FormControlErrorText } from '@/components/ui/form-control';

// Importación de componentes nativos de React Native
import { Alert } from 'react-native';

// Interface que define la estructura de un establecimiento/almacén
interface Establecimiento {
  id: string;
  nombre: string;
  calle: string;
  cp: string;
  colonia: string;
  celular: string;
}

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
    <Box className="flex-1 bg-[#000000]">
      <ScrollView className="flex-1">
        <Box className="p-6">
          {/* Título principal de la pantalla */}
          <Heading className="font-bold text-4xl mb-8 text-[#B8860B]">
            Mis Almacenes
          </Heading>

          {/* Renderizado condicional: mostrar lista O formulario, nunca ambos */}
          {!showForm ? (
            <>
              {/* Botón para mostrar el formulario de agregar nuevo almacén */}
              <Box className="mb-8">
                <Button
                  size="xl"
                  action="primary"
                  onPress={() => setShowForm(true)}
                  className="bg-[#FFD700] py-2 rounded-2xl"
                >
                  <ButtonText className="text-2xl font-bold text-black">
                    ➕ Agregar Almacén Nuevo
                  </ButtonText>
                </Button>
              </Box>

              {/* Lista de Establecimientos - Muestra tarjetas grandes para cada almacén */}
              {/* Si no hay establecimientos, mostrar mensaje de vacío */}
              {establecimientos.length === 0 ? (
                <Box className="mt-8 items-center bg-[#1a1a1a] p-10 rounded-2xl border-3 border-[#FFD700]">
                  <Text className="text-3xl mb-4">🏢</Text>
                  <Text className="text-2xl text-[#FFD700] text-center font-semibold mb-3">
                    Aún no tiene almacenes registrados
                  </Text>
                  <Text className="text-xl text-[#FFD700] text-center">
                    Toque el botón de arriba para agregar su primer almacén
                  </Text>
                </Box>
              ) : (
                // Si hay establecimientos, mostrarlos en una lista vertical
                <VStack space="lg">
                  {/* Mapear cada establecimiento a una tarjeta */}
                  {establecimientos.map((establecimiento) => (
                    <Box
                      key={establecimiento.id}
                      className="bg-[#1a1a1a] p-8 rounded-2xl border-3 border-[#FFD700] shadow-lg"
                    >
                      <VStack space="lg">
                        {/* Sección del nombre del establecimiento */}
                        <Box className="bg-[#2a2a2a] p-5 rounded-xl border-2 border-[#FFD700]">
                          <Text className="text-2xl font-bold text-[#FFD700] mb-2">
                            🏢 {establecimiento.nombre}
                          </Text>
                        </Box>

                        {/* Sección de la dirección */}
                        <Box className="bg-[#2a2a2a] p-5 rounded-xl border-2 border-[#FFD700]">
                          <Text className="text-xl font-bold text-[#FFD700] mb-3">
                            📍 Dirección:
                          </Text>
                          <Text className="text-2xl text-[#FFD700] mb-2">
                            {establecimiento.calle}
                          </Text>
                          <Text className="text-2xl text-[#FFD700]">
                            {establecimiento.colonia}
                          </Text>
                          <Text className="text-xl text-[#FFD700] mt-2">
                            Código Postal: {establecimiento.cp}
                          </Text>
                        </Box>

                        {/* Sección del teléfono de contacto */}
                        <Box className="bg-[#2a2a2a] p-5 rounded-xl border-2 border-[#FFD700]">
                          <Text className="text-xl font-bold text-[#FFD700] mb-2">
                            📞 Teléfono:
                          </Text>
                          <Text className="text-2xl text-[#FFD700]">
                            {establecimiento.celular}
                          </Text>
                        </Box>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </>
          ) : (
            // Formulario para agregar un nuevo almacén
            <Box className="bg-[#1a1a1a] p-8 rounded-2xl border-3 border-[#FFD700] shadow-lg">
              <Heading className="font-bold text-4xl mb-4 text-[#FFD700]">
                Agregar Almacén Nuevo
              </Heading>
              <Text className="text-xl text-[#FFD700] mb-8 font-semibold">
                Complete la información paso a paso. Todos los campos marcados con * son obligatorios.
              </Text>

              <VStack space="xl">
                {/* ====== Paso 1: Información Básica ====== */}
                {/* Encabezado del paso 1 */}
                <Box className="bg-[#2a2a2a] p-4 rounded-xl border-2 border-[#FFD700] mb-4">
                  <Text className="text-2xl font-bold text-[#FFD700] mb-1">
                    Paso 1: Información Básica
                  </Text>
                  <Text className="text-lg text-[#FFD700]">
                    Escriba el nombre del almacén
                  </Text>
                </Box>

                {/* Campo: Nombre del Establecimiento */}
                {/* FormControl maneja el estado de validación y muestra errores */}
                <FormControl isInvalid={!!errors.nombre}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿Cómo se llama este almacén? *
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
                      placeholder="Ejemplo: Almacén Central, Bodega Principal"
                      value={formData.nombre}
                      onChangeText={(text) => {
                        // Actualizar el valor del campo en el estado
                        setFormData({ ...formData, nombre: text });
                        // Si había un error, limpiarlo cuando el usuario empiece a escribir
                        if (errors.nombre) {
                          setErrors({ ...errors, nombre: '' });
                        }
                      }}
                      className="text-2xl py-4 text-[#FFD700]"
                      placeholderTextColor="#B8860B"
                    />
                  </Input>
                  {/* Mostrar mensaje de error solo si existe */}
                  {errors.nombre && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ {errors.nombre}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* ====== Paso 2: Dirección ====== */}
                {/* Encabezado del paso 2 */}
                <Box className="bg-[#2a2a2a] p-4 rounded-xl border-2 border-[#FFD700] mb-4">
                  <Text className="text-2xl font-bold text-[#FFD700] mb-1">
                    Paso 2: Dirección
                  </Text>
                  <Text className="text-lg text-[#FFD700]">
                    Escriba la dirección completa del almacén
                  </Text>
                </Box>

                {/* Campo: Calle y número */}
                <FormControl isInvalid={!!errors.calle}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿En qué calle y número está? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.calle ? 'border-red-600' : 'border-[#FFD700]'
                    } bg-[#2a2a2a]`}
                  >
                    <InputField
                      placeholder="Ejemplo: Av. Principal 123"
                      value={formData.calle}
                      onChangeText={(text) => {
                        setFormData({ ...formData, calle: text });
                        if (errors.calle) {
                          setErrors({ ...errors, calle: '' });
                        }
                      }}
                      className="text-2xl py-4 text-[#FFD700]"
                      placeholderTextColor="#B8860B"
                    />
                  </Input>
                  {errors.calle && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ {errors.calle}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Campo: Colonia */}
                <FormControl isInvalid={!!errors.colonia}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿En qué colonia está? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.colonia ? 'border-red-600' : 'border-[#FFD700]'
                    } bg-[#2a2a2a]`}
                  >
                    <InputField
                      placeholder="Ejemplo: Centro, Del Valle, Industrial"
                      value={formData.colonia}
                      onChangeText={(text) => {
                        setFormData({ ...formData, colonia: text });
                        if (errors.colonia) {
                          setErrors({ ...errors, colonia: '' });
                        }
                      }}
                      className="text-2xl py-4 text-[#FFD700]"
                      placeholderTextColor="#B8860B"
                    />
                  </Input>
                  {errors.colonia && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ {errors.colonia}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Campo: Código Postal (solo acepta números, máximo 5 dígitos) */}
                <FormControl isInvalid={!!errors.cp}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿Cuál es el código postal? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.cp ? 'border-red-600' : 'border-[#FFD700]'
                    } bg-[#2a2a2a]`}
                  >
                    <InputField
                      placeholder="Ejemplo: 12345"
                      value={formData.cp}
                      onChangeText={(text) => {
                        // Eliminar cualquier carácter que no sea número
                        setFormData({ ...formData, cp: text.replace(/\D/g, '') });
                        if (errors.cp) {
                          setErrors({ ...errors, cp: '' });
                        }
                      }}
                      keyboardType="numeric" // Mostrar teclado numérico en móvil
                      maxLength={5} // Limitar a 5 caracteres
                      className="text-2xl py-4 text-center text-[#FFD700]"
                      placeholderTextColor="#B8860B"
                    />
                  </Input>
                  {errors.cp && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ {errors.cp}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* ====== Paso 3: Contacto ====== */}
                {/* Encabezado del paso 3 */}
                <Box className="bg-[#2a2a2a] p-4 rounded-xl border-2 border-[#FFD700] mb-4">
                  <Text className="text-2xl font-bold text-[#FFD700] mb-1">
                    Paso 3: Contacto
                  </Text>
                  <Text className="text-lg text-[#FFD700]">
                    Escriba el número de teléfono del almacén
                  </Text>
                </Box>

                {/* Campo: Número de Celular (solo acepta números, máximo 10 dígitos) */}
                <FormControl isInvalid={!!errors.celular}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿Cuál es el número de teléfono? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.celular ? 'border-red-600' : 'border-[#FFD700]'
                    } bg-[#2a2a2a]`}
                  >
                    <InputField
                      placeholder="Ejemplo: 5551234567"
                      value={formData.celular}
                      onChangeText={(text) => {
                        // Eliminar cualquier carácter que no sea número
                        const cleaned = text.replace(/\D/g, '');
                        setFormData({ ...formData, celular: cleaned });
                        if (errors.celular) {
                          setErrors({ ...errors, celular: '' });
                        }
                      }}
                      keyboardType="phone-pad" // Mostrar teclado de teléfono en móvil
                      maxLength={10} // Limitar a 10 dígitos
                      className="text-2xl py-4 text-center text-[#FFD700]"
                      placeholderTextColor="#B8860B"
                    />
                  </Input>
                  {errors.celular && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ {errors.celular}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* ====== Botones de acción ====== */}
                <VStack space="lg" className="mt-8">
                  {/* Botón para guardar el nuevo almacén (valida y guarda) */}
                  <Button
                    size="xl"
                    action="primary"
                    onPress={handleSubmit}
                    className="bg-[#FFD700] py-2 rounded-2xl"
                  >
                    <ButtonText className="text-2xl font-bold text-black">
                      ✅ Guardar Almacén
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
                    <ButtonText className="text-2xl font-bold text-[#FFD700]">
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

