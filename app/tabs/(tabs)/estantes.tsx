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
import { ChevronDownIcon } from '@/components/ui/icon';

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
  codigo: string; // Ej: A-01, A-02, B-01, etc.
}

export default function Estantes() {
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

  const [estantes, setEstantes] = useState<Estante[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    establecimientoId: '',
    seccion: '',
    niveles: '',
  });

  const [errors, setErrors] = useState({
    establecimientoId: '',
    seccion: '',
    niveles: '',
  });

  const validateForm = () => {
    const newErrors = {
      establecimientoId: '',
      seccion: '',
      niveles: '',
    };

    if (!formData.establecimientoId) {
      newErrors.establecimientoId = 'Por favor, elija un almacén de la lista';
    }

    if (!formData.seccion.trim()) {
      newErrors.seccion = 'Por favor, escriba una letra para la sección';
    } else if (!/^[A-Z]$/i.test(formData.seccion.trim())) {
      newErrors.seccion = 'Por favor, escriba solo una letra (A, B, C, etc.)';
    }

    if (!formData.niveles.trim()) {
      newErrors.niveles = 'Por favor, ingrese cuántos niveles quiere crear';
    } else {
      const niveles = parseInt(formData.niveles);
      if (isNaN(niveles) || niveles < 1 || niveles > 99) {
        newErrors.niveles = 'Por favor, ingrese un número entre 1 y 99';
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const establecimiento = establecimientos.find(
        (e) => e.id === formData.establecimientoId
      );

      if (!establecimiento) return;

      const seccion = formData.seccion.trim().toUpperCase();
      const cantidadNiveles = parseInt(formData.niveles);
      const nuevosEstantes: Estante[] = [];

      // Generar todos los estantes para la sección
      for (let i = 1; i <= cantidadNiveles; i++) {
        const codigo = `${seccion}-${String(i).padStart(2, '0')}`;
        nuevosEstantes.push({
          id: `${Date.now()}-${i}`,
          establecimientoId: establecimiento.id,
          establecimientoNombre: establecimiento.nombre,
          seccion: seccion,
          nivel: i,
          codigo: codigo,
        });
      }

      setEstantes([...estantes, ...nuevosEstantes]);
      setFormData({
        establecimientoId: '',
        seccion: '',
        niveles: '',
      });
      setShowForm(false);
      setErrors({
        establecimientoId: '',
        seccion: '',
        niveles: '',
      });
      
      // Mostrar confirmación de éxito
      Alert.alert(
        '✅ ¡Lugares Creados!',
        `Se han creado ${cantidadNiveles} lugares de guardado en la sección ${seccion}.`,
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      establecimientoId: '',
      seccion: '',
      niveles: '',
    });
    setErrors({
      establecimientoId: '',
      seccion: '',
      niveles: '',
    });
  };

  // Agrupar estantes por establecimiento
  const estantesPorEstablecimiento = estantes.reduce((acc, estante) => {
    if (!acc[estante.establecimientoId]) {
      acc[estante.establecimientoId] = {
        establecimiento: establecimientos.find((e) => e.id === estante.establecimientoId),
        estantes: [],
      };
    }
    acc[estante.establecimientoId].estantes.push(estante);
    return acc;
  }, {} as Record<string, { establecimiento?: Establecimiento; estantes: Estante[] }>);

  return (
    <Box className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <Box className="p-6">
          <Heading className="font-bold text-4xl mb-8 text-gray-900">
            Lugares de Guardado
          </Heading>

          {establecimientos.length === 0 ? (
            <Box className="bg-yellow-50 border-3 border-yellow-400 p-8 rounded-2xl">
              <Text className="text-2xl text-yellow-900 text-center font-bold mb-3">
                ⚠️ Configuración Necesaria
              </Text>
              <Text className="text-xl text-yellow-800 text-center font-semibold mb-2">
                Primero debe crear un almacén
              </Text>
              <Text className="text-lg text-yellow-700 text-center">
                Vaya a la pestaña "Mis Almacenes" para crear uno
              </Text>
            </Box>
          ) : !showForm ? (
            <>
              <Box className="mb-8">
                <Button
                  size="xl"
                  action="primary"
                  onPress={() => setShowForm(true)}
                  className="bg-blue-600 py-2 rounded-2xl"
                >
                  <ButtonText className="text-2xl font-bold">
                    ➕ Crear Lugares de Guardado
                  </ButtonText>
                </Button>
              </Box>

              {/* Lista de Estantes agrupados por Establecimiento */}
              {estantes.length === 0 ? (
                <Box className="mt-8 items-center bg-white p-10 rounded-2xl border-3 border-gray-300">
                  <Text className="text-3xl mb-4">📍</Text>
                  <Text className="text-2xl text-gray-800 text-center font-semibold mb-3">
                    Aún no tiene lugares de guardado registrados
                  </Text>
                  <Text className="text-xl text-gray-600 text-center">
                    Toque el botón de arriba para crear lugares donde guardar sus productos
                  </Text>
                </Box>
              ) : (
                <VStack space="xl">
                  {Object.values(estantesPorEstablecimiento).map((grupo) => (
                    <Box key={grupo.establecimiento?.id} className="mb-8">
                      <Box className="bg-blue-100 p-5 rounded-t-2xl border-3 border-blue-400">
                        <Text className="text-3xl font-bold text-blue-900">
                          🏢 {grupo.establecimiento?.nombre}
                        </Text>
                      </Box>

                      {/* Agrupar estantes por sección */}
                      {Object.entries(
                        grupo.estantes.reduce((acc, estante) => {
                          if (!acc[estante.seccion]) {
                            acc[estante.seccion] = [];
                          }
                          acc[estante.seccion].push(estante);
                          return acc;
                        }, {} as Record<string, Estante[]>)
                      ).map(([seccion, estantesSeccion]) => (
                        <Box
                          key={seccion}
                          className="bg-white border-3 border-blue-400 border-t-0 rounded-b-2xl p-6"
                        >
                          <Text className="text-2xl font-bold text-gray-800 mb-4">
                            📍 Sección {seccion}
                          </Text>
                          <Box className="flex-row flex-wrap gap-3">
                            {estantesSeccion
                              .sort((a, b) => a.nivel - b.nivel)
                              .map((estante) => (
                                <Box
                                  key={estante.id}
                                  className="bg-gray-100 border-3 border-gray-400 px-5 py-4 rounded-xl min-w-[100px] items-center"
                                >
                                  <Text className="text-2xl font-bold text-gray-900">
                                    {estante.codigo}
                                  </Text>
                                </Box>
                              ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </VStack>
              )}
            </>
          ) : (
            <Box className="bg-white p-8 rounded-2xl border-3 border-gray-400 shadow-lg">
              <Heading className="font-bold text-4xl mb-4 text-gray-900">
                Crear Lugares de Guardado
              </Heading>
              <Text className="text-xl text-gray-700 mb-8 font-semibold">
                Complete los campos para crear lugares de guardado automáticamente. Se crearán todos los niveles de la sección que indique.
              </Text>

              <VStack space="xl">
                {/* Paso 1: Seleccionar Almacén */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 1: Seleccionar Almacén
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Elija en qué almacén quiere crear los lugares de guardado
                  </Text>
                </Box>

                {/* Selector de Establecimiento */}
                <FormControl isInvalid={!!errors.establecimientoId}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿En qué almacén quiere crear los lugares? *
                    </Text>
                  </FormControlLabel>
                  <Select
                    selectedValue={formData.establecimientoId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, establecimientoId: value });
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
                        ⚠️ {errors.establecimientoId}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Paso 2: Configurar Sección y Niveles */}
                <Box className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <Text className="text-2xl font-bold text-blue-900 mb-1">
                    Paso 2: Configurar Sección y Cantidad
                  </Text>
                  <Text className="text-lg text-blue-800">
                    Indique la letra de la sección y cuántos lugares quiere crear
                  </Text>
                </Box>

                {/* Sección */}
                <FormControl isInvalid={!!errors.seccion}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Qué letra quiere usar para la sección? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.seccion ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: A, B, C"
                      value={formData.seccion}
                      onChangeText={(text) => {
                        const upperText = text.toUpperCase().replace(/[^A-Z]/g, '');
                        setFormData({ ...formData, seccion: upperText });
                        if (errors.seccion) {
                          setErrors({ ...errors, seccion: '' });
                        }
                      }}
                      maxLength={1}
                      className="text-2xl py-4 text-center"
                      autoCapitalize="characters"
                    />
                  </Input>
                  {errors.seccion && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ {errors.seccion}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                  <Text className="text-xl text-gray-700 mt-2 font-semibold">
                    Escriba solo una letra (A, B, C, D, etc.)
                  </Text>
                </FormControl>

                {/* Niveles */}
                <FormControl isInvalid={!!errors.niveles}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-gray-900 mb-3">
                      ¿Cuántos lugares quiere crear? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.niveles ? 'border-red-600' : 'border-gray-500'
                    }`}
                  >
                    <InputField
                      placeholder="Ejemplo: 5"
                      value={formData.niveles}
                      onChangeText={(text) => {
                        setFormData({
                          ...formData,
                          niveles: text.replace(/\D/g, ''),
                        });
                        if (errors.niveles) {
                          setErrors({ ...errors, niveles: '' });
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                      className="text-2xl py-4 text-center"
                    />
                  </Input>
                  {errors.niveles && (
                    <FormControlError>
                      <FormControlErrorText className="text-xl font-semibold text-red-700">
                        ⚠️ {errors.niveles}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                  {formData.seccion && formData.niveles && !errors.seccion && !errors.niveles && (
                    <Box className="bg-green-50 p-4 rounded-xl border-2 border-green-400 mt-3">
                      <Text className="text-xl font-semibold text-green-900">
                        Se crearán lugares desde {formData.seccion.toUpperCase()}-01 hasta{' '}
                        {formData.seccion.toUpperCase()}-
                        {String(formData.niveles).padStart(2, '0')}
                      </Text>
                    </Box>
                  )}
                </FormControl>

                {/* Vista previa */}
                {formData.seccion &&
                  formData.niveles &&
                  !errors.seccion &&
                  !errors.niveles && (
                    <Box className="bg-green-50 border-3 border-green-500 p-6 rounded-2xl">
                      <Text className="text-2xl font-bold text-green-900 mb-4">
                        ✅ Vista Previa - Se crearán los siguientes lugares:
                      </Text>
                      <Box className="flex-row flex-wrap gap-3">
                        {Array.from(
                          { length: parseInt(formData.niveles) },
                          (_, i) => i + 1
                        ).map((nivel) => (
                          <Box
                            key={nivel}
                            className="bg-white border-2 border-green-500 px-4 py-3 rounded-xl"
                          >
                            <Text className="text-2xl font-bold text-green-900">
                              {formData.seccion.toUpperCase()}-
                              {String(nivel).padStart(2, '0')}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                {/* Botones */}
                <VStack space="lg" className="mt-8">
                  <Button
                    size="xl"
                    action="primary"
                    onPress={handleSubmit}
                    className="bg-green-600 py-2 rounded-2xl"
                  >
                    <ButtonText className="text-2xl font-bold">
                      ✅ Crear Lugares de Guardado
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
