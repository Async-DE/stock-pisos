import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { FormControl, FormControlLabel, FormControlError, FormControlErrorText } from '@/components/ui/form-control';

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
      newErrors.nombre = 'El nombre del establecimiento es requerido';
    }

    if (!formData.calle.trim()) {
      newErrors.calle = 'La calle es requerida';
    }

    if (!formData.cp.trim()) {
      newErrors.cp = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(formData.cp)) {
      newErrors.cp = 'El código postal debe tener 5 dígitos';
    }

    if (!formData.colonia.trim()) {
      newErrors.colonia = 'La colonia es requerida';
    }

    if (!formData.celular.trim()) {
      newErrors.celular = 'El número de celular es requerido';
    } else if (!/^\d{10}$/.test(formData.celular.replace(/\D/g, ''))) {
      newErrors.celular = 'El número de celular debe tener 10 dígitos';
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
          <Heading className="font-bold text-3xl mb-6 text-gray-900">
            Establecimientos
          </Heading>

          {!showForm ? (
            <>
              <Box className="mb-6">
                <Button
                  size="xl"
                  action="primary"
                  onPress={() => setShowForm(true)}
                  className="bg-blue-600 py-2"
                >
                  <ButtonText className="text-lg font-semibold">
                    + Agregar Nuevo Establecimiento
                  </ButtonText>
                </Button>
              </Box>

              {/* Lista de Establecimientos - Tarjetas grandes */}
              {establecimientos.length === 0 ? (
                <Box className="mt-8 items-center bg-white p-8 rounded-xl border-2 border-gray-200">
                  <Text className="text-xl text-gray-600 text-center">
                    No hay establecimientos registrados
                  </Text>
                  <Text className="text-lg text-gray-500 text-center mt-2">
                    Presiona el botón de arriba para agregar uno
                  </Text>
                </Box>
              ) : (
                <VStack space="lg">
                  {establecimientos.map((establecimiento) => (
                    <Box
                      key={establecimiento.id}
                      className="bg-white p-6 rounded-xl border-2 border-gray-300 shadow-sm"
                    >
                      <VStack space="md">
                        <Box>
                          <Text className="text-lg font-semibold text-gray-700 mb-1">
                            Nombre:
                          </Text>
                          <Text className="text-xl font-bold text-gray-900">
                            {establecimiento.nombre}
                          </Text>
                        </Box>

                        <Box className="border-t border-gray-200 pt-4">
                          <Text className="text-lg font-semibold text-gray-700 mb-1">
                            Dirección:
                          </Text>
                          <Text className="text-xl text-gray-900">
                            {establecimiento.calle}
                          </Text>
                          <Text className="text-xl text-gray-900">
                            {establecimiento.colonia}, CP {establecimiento.cp}
                          </Text>
                        </Box>

                        <Box className="border-t border-gray-200 pt-4">
                          <Text className="text-lg font-semibold text-gray-700 mb-1">
                            Teléfono:
                          </Text>
                          <Text className="text-xl text-gray-900">
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
            <Box className="bg-white p-6 rounded-xl border-2 border-gray-300 shadow-md">
              <Heading className="font-bold text-2xl mb-6 text-gray-900">
                Nuevo Establecimiento
              </Heading>
              <Text className="text-lg text-gray-600 mb-6">
                Complete todos los campos para registrar un nuevo almacén
              </Text>

              <VStack space="xl">
                {/* Nombre del Establecimiento */}
                <FormControl isInvalid={!!errors.nombre}>
                  <FormControlLabel>
                    <Text className="text-xl font-semibold text-gray-900 mb-2">
                      Nombre del Establecimiento
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-xl border-2 ${
                      errors.nombre ? 'border-red-500' : 'border-gray-400'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: Almacén Central"
                      value={formData.nombre}
                      onChangeText={(text) => {
                        setFormData({ ...formData, nombre: text });
                        if (errors.nombre) {
                          setErrors({ ...errors, nombre: '' });
                        }
                      }}
                      className="text-xl py-3"
                    />
                  </Input>
                  {errors.nombre && (
                    <FormControlError>
                      <FormControlErrorText className="text-lg">
                        {errors.nombre}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Calle */}
                <FormControl isInvalid={!!errors.calle}>
                  <FormControlLabel>
                    <Text className="text-xl font-semibold text-gray-900 mb-2">
                      Calle
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-xl border-2 ${
                      errors.calle ? 'border-red-500' : 'border-gray-400'
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
                      className="text-xl py-3"
                    />
                  </Input>
                  {errors.calle && (
                    <FormControlError>
                      <FormControlErrorText className="text-lg">
                        {errors.calle}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Código Postal */}
                <FormControl isInvalid={!!errors.cp}>
                  <FormControlLabel>
                    <Text className="text-xl font-semibold text-gray-900 mb-2">
                      Código Postal
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-xl border-2 ${
                      errors.cp ? 'border-red-500' : 'border-gray-400'
                    }`}
                  >
                    <InputField
                      placeholder="12345"
                      value={formData.cp}
                      onChangeText={(text) => {
                        setFormData({ ...formData, cp: text.replace(/\D/g, '') });
                        if (errors.cp) {
                          setErrors({ ...errors, cp: '' });
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={5}
                      className="text-xl py-3"
                    />
                  </Input>
                  {errors.cp && (
                    <FormControlError>
                      <FormControlErrorText className="text-lg">
                        {errors.cp}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Colonia */}
                <FormControl isInvalid={!!errors.colonia}>
                  <FormControlLabel>
                    <Text className="text-xl font-semibold text-gray-900 mb-2">
                      Colonia
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-xl border-2 ${
                      errors.colonia ? 'border-red-500' : 'border-gray-400'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: Centro"
                      value={formData.colonia}
                      onChangeText={(text) => {
                        setFormData({ ...formData, colonia: text });
                        if (errors.colonia) {
                          setErrors({ ...errors, colonia: '' });
                        }
                      }}
                      className="text-xl py-3"
                    />
                  </Input>
                  {errors.colonia && (
                    <FormControlError>
                      <FormControlErrorText className="text-lg">
                        {errors.colonia}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Número de Celular */}
                <FormControl isInvalid={!!errors.celular}>
                  <FormControlLabel>
                    <Text className="text-xl font-semibold text-gray-900 mb-2">
                      Número de Celular
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-xl border-2 ${
                      errors.celular ? 'border-red-500' : 'border-gray-400'
                    }`}
                  >
                    <InputField
                      placeholder="5551234567"
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
                      className="text-xl py-3"
                    />
                  </Input>
                  {errors.celular && (
                    <FormControlError>
                      <FormControlErrorText className="text-lg">
                        {errors.celular}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Botones */}
                <VStack space="md" className="mt-6">
                  <Button
                    size="xl"
                    action="primary"
                    onPress={handleSubmit}
                    className="bg-blue-600 py-2"
                  >
                    <ButtonText className="text-xl font-semibold">
                      Guardar Establecimiento
                    </ButtonText>
                  </Button>
                  <Button
                    size="xl"
                    action="secondary"
                    variant="outline"
                    onPress={handleCancel}
                    className="border-2 border-gray-400 py-2"
                  >
                    <ButtonText className="text-xl font-semibold text-gray-700">
                      Cancelar
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

