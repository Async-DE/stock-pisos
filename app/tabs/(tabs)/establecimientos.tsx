import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { FormControl, FormControlLabel, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Alert } from 'react-native';

interface Establecimiento {
  id: string;
  nombre: string;
  calle: string;
  cp: string;
  colonia: string;
  celular: string;
}

export default function Establecimientos() {
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([
    // Datos de ejemplo
    {
      id: '1',
      nombre: 'Almacén Central',
      calle: 'Av. Principal 123',
      cp: '12345',
      colonia: 'Centro',
      celular: '5551234567',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    calle: '',
    cp: '',
    colonia: '',
    celular: '',
  });

  const [errors, setErrors] = useState({
    nombre: '',
    calle: '',
    cp: '',
    colonia: '',
    celular: '',
  });

  const validateForm = () => {
    const newErrors = {
      nombre: '',
      calle: '',
      cp: '',
      colonia: '',
      celular: '',
    };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Por favor, escriba el nombre del almacén';
    }

    if (!formData.calle.trim()) {
      newErrors.calle = 'Por favor, escriba la calle y número';
    }

    if (!formData.cp.trim()) {
      newErrors.cp = 'Por favor, ingrese el código postal';
    } else if (!/^\d{5}$/.test(formData.cp)) {
      newErrors.cp = 'El código postal debe tener exactamente 5 dígitos';
    }

    if (!formData.colonia.trim()) {
      newErrors.colonia = 'Por favor, escriba la colonia';
    }

    if (!formData.celular.trim()) {
      newErrors.celular = 'Por favor, ingrese el número de teléfono';
    } else if (!/^\d{10}$/.test(formData.celular.replace(/\D/g, ''))) {
      newErrors.celular = 'El número de teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newEstablecimiento: Establecimiento = {
        id: Date.now().toString(),
        nombre: formData.nombre.trim(),
        calle: formData.calle.trim(),
        cp: formData.cp.trim(),
        colonia: formData.colonia.trim(),
        celular: formData.celular.replace(/\D/g, ''),
      };

      setEstablecimientos([...establecimientos, newEstablecimiento]);
      setFormData({
        nombre: '',
        calle: '',
        cp: '',
        colonia: '',
        celular: '',
      });
      setShowForm(false);
      setErrors({
        nombre: '',
        calle: '',
        cp: '',
        colonia: '',
        celular: '',
      });
      
      // Mostrar confirmación de éxito
      Alert.alert(
        '✅ ¡Almacén Creado!',
        'El almacén se ha guardado correctamente.',
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      nombre: '',
      calle: '',
      cp: '',
      colonia: '',
      celular: '',
    });
    setErrors({
      nombre: '',
      calle: '',
      cp: '',
      colonia: '',
      celular: '',
    });
  };

  return (
    <Box className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <Box className="p-6">
          <Heading className="font-bold text-4xl mb-8 text-gray-900">
            Mis Almacenes
          </Heading>

          {!showForm ? (
            <>
              <Box className="mb-8">
                <Button
                  size="xl"
                  action="primary"
                  onPress={() => setShowForm(true)}
                  className="bg-blue-600 py-2 rounded-2xl"
                >
                  <ButtonText className="text-2xl font-bold">
                    ➕ Agregar Almacén Nuevo
                  </ButtonText>
                </Button>
              </Box>

              {/* Lista de Establecimientos - Tarjetas grandes */}
              {establecimientos.length === 0 ? (
                <Box className="mt-8 items-center bg-white p-10 rounded-2xl border-3 border-gray-300">
                  <Text className="text-3xl mb-4">🏢</Text>
                  <Text className="text-2xl text-gray-800 text-center font-semibold mb-3">
                    Aún no tiene almacenes registrados
                  </Text>
                  <Text className="text-xl text-gray-600 text-center">
                    Toque el botón de arriba para agregar su primer almacén
                  </Text>
                </Box>
              ) : (
                <VStack space="lg">
                  {establecimientos.map((establecimiento) => (
                    <Box
                      key={establecimiento.id}
                      className="bg-white p-8 rounded-2xl border-3 border-gray-400 shadow-lg"
                    >
                      <VStack space="lg">
                        <Box className="bg-blue-50 p-5 rounded-xl border-2 border-blue-300">
                          <Text className="text-2xl font-bold text-blue-900 mb-2">
                            🏢 {establecimiento.nombre}
                          </Text>
                        </Box>

                        <Box className="bg-gray-50 p-5 rounded-xl border-2 border-gray-300">
                          <Text className="text-xl font-bold text-gray-900 mb-3">
                            📍 Dirección:
                          </Text>
                          <Text className="text-2xl text-gray-800 mb-2">
                            {establecimiento.calle}
                          </Text>
                          <Text className="text-2xl text-gray-800">
                            {establecimiento.colonia}
                          </Text>
                          <Text className="text-xl text-gray-700 mt-2">
                            Código Postal: {establecimiento.cp}
                          </Text>
                        </Box>

                        <Box className="bg-gray-50 p-5 rounded-xl border-2 border-gray-300">
                          <Text className="text-xl font-bold text-gray-900 mb-2">
                            📞 Teléfono:
                          </Text>
                          <Text className="text-2xl text-gray-800">
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
            <Box className="bg-white p-8 rounded-2xl border-3 border-gray-400 shadow-lg">
              <Heading className="font-bold text-4xl mb-4 text-gray-900">
                Agregar Almacén Nuevo
              </Heading>
              <Text className="text-xl text-gray-700 mb-8 font-semibold">
                Complete la información paso a paso. Todos los campos marcados con * son obligatorios.
              </Text>

              <VStack space="xl">
                {/* Paso 1: Información Básica */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 1: Información Básica
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Escriba el nombre del almacén
                  </Text>
                </Box>

                {/* Nombre del Establecimiento */}
                <FormControl isInvalid={!!errors.nombre}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Cómo se llama este almacén? *
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
                      placeholder="Ejemplo: Almacén Central, Bodega Principal"
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
                        ⚠️ {errors.nombre}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Paso 2: Dirección */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 2: Dirección
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Escriba la dirección completa del almacén
                  </Text>
                </Box>

                {/* Calle */}
                <FormControl isInvalid={!!errors.calle}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿En qué calle y número está? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.calle ? 'border-red-600' : 'border-gray-500'
                    }`}
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
                      className="text-2xl py-4"
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

                {/* Colonia */}
                <FormControl isInvalid={!!errors.colonia}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿En qué colonia está? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.colonia ? 'border-red-600' : 'border-gray-500'
                    }`}
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
                      className="text-2xl py-4"
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

                {/* Código Postal */}
                <FormControl isInvalid={!!errors.cp}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Cuál es el código postal? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.cp ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: 12345"
                      value={formData.cp}
                      onChangeText={(text) => {
                        setFormData({ ...formData, cp: text.replace(/\D/g, '') });
                        if (errors.cp) {
                          setErrors({ ...errors, cp: '' });
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={5}
                      className="text-2xl py-4 text-center"
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

                {/* Paso 3: Contacto */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 3: Contacto
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Escriba el número de teléfono del almacén
                  </Text>
                </Box>

                {/* Número de Celular */}
                <FormControl isInvalid={!!errors.celular}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Cuál es el número de teléfono? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.celular ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: 5551234567"
                      value={formData.celular}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/\D/g, '');
                        setFormData({ ...formData, celular: cleaned });
                        if (errors.celular) {
                          setErrors({ ...errors, celular: '' });
                        }
                      }}
                      keyboardType="phone-pad"
                      maxLength={10}
                      className="text-2xl py-4 text-center"
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

                {/* Botones */}
                <VStack space="lg" className="mt-8">
                  <Button
                    size="xl"
                    action="primary"
                    onPress={handleSubmit}
                    className="bg-green-600 py-2 rounded-2xl"
                  >
                    <ButtonText className="text-2xl font-bold">
                      ✅ Guardar Almacén
                    </ButtonText>
                  </Button>
                  <Button
                    size="xl"
                    action="secondary"
                    variant="outline"
                    onPress={handleCancel}
                    className="border-3 border-gray-500 py-2 rounded-2xl"
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

