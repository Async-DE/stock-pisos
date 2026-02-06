// Importaciones de React y hooks necesarios
import React, { useState } from 'react';

// Importación de componentes UI básicos
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

// Importación de iconos
import { ChevronDownIcon } from '@/components/ui/icon';

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
  id: string;                      // ID único del estante
  establecimientoId: string;       // ID del almacén al que pertenece
  establecimientoNombre: string;   // Nombre del almacén (para mostrar)
  seccion: string;                 // Letra de la sección (A, B, C, etc.)
  nivel: number;                   // Número del nivel/posición
  codigo: string;                  // Código completo del estante (Ej: A-01, A-02, B-01)
}

export default function Estantes() {
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

  // Estado que almacena todos los estantes/lugares de guardado creados
  const [estantes, setEstantes] = useState<Estante[]>([]);

  // Estado que controla si se muestra el formulario de crear estantes
  const [showForm, setShowForm] = useState(false);
  
  // Estado que almacena los datos del formulario de creación de estantes
  const [formData, setFormData] = useState({
    establecimientoId: '',  // ID del almacén seleccionado
    seccion: '',            // Letra de la sección (A, B, C, etc.)
    niveles: '',            // Cantidad de lugares a crear en esa sección
  });

  // Estado que almacena los mensajes de error de validación para cada campo
  const [errors, setErrors] = useState({
    establecimientoId: '',
    seccion: '',
    niveles: '',
  });

  // Función que valida todos los campos del formulario antes de crear los estantes
  const validateForm = () => {
    // Objeto temporal para almacenar los errores de validación
    const newErrors = {
      establecimientoId: '',
      seccion: '',
      niveles: '',
    };

    // Validar que se haya seleccionado un almacén
    if (!formData.establecimientoId) {
      newErrors.establecimientoId = 'Por favor, elija un almacén de la lista';
    }

    // Validar que la sección sea una sola letra
    if (!formData.seccion.trim()) {
      newErrors.seccion = 'Por favor, escriba una letra para la sección';
    } else if (!/^[A-Z]$/i.test(formData.seccion.trim())) {
      newErrors.seccion = 'Por favor, escriba solo una letra (A, B, C, etc.)';
    }

    // Validar que los niveles sean un número válido entre 1 y 99
    if (!formData.niveles.trim()) {
      newErrors.niveles = 'Por favor, ingrese cuántos niveles quiere crear';
    } else {
      const niveles = parseInt(formData.niveles);
      if (isNaN(niveles) || niveles < 1 || niveles > 99) {
        newErrors.niveles = 'Por favor, ingrese un número entre 1 y 99';
      }
    }

    // Actualizar el estado de errores
    setErrors(newErrors);
    // Retornar true si no hay errores, false si hay al menos un error
    return !Object.values(newErrors).some((error) => error !== '');
  };

  // Función que se ejecuta al presionar el botón "Crear Lugares de Guardado"
  const handleSubmit = () => {
    // Primero validar que todos los campos sean correctos
    if (validateForm()) {
      // Buscar el establecimiento seleccionado en la lista
      const establecimiento = establecimientos.find(
        (e) => e.id === formData.establecimientoId
      );

      // Si no se encuentra el establecimiento, salir
      if (!establecimiento) return;

      // Preparar los datos normalizados
      const seccion = formData.seccion.trim().toUpperCase();  // Convertir a mayúscula
      const cantidadNiveles = parseInt(formData.niveles);      // Convertir a número
      const nuevosEstantes: Estante[] = [];                    // Array para almacenar los nuevos estantes

      // Generar todos los estantes para la sección mediante un loop
      // Si el usuario pide 5 niveles en sección A, creará: A-01, A-02, A-03, A-04, A-05
      for (let i = 1; i <= cantidadNiveles; i++) {
        // Generar el código del estante (ej: A-01, A-02, etc.)
        // padStart(2, '0') asegura que siempre tenga 2 dígitos (01, 02, 10, etc.)
        const codigo = `${seccion}-${String(i).padStart(2, '0')}`;
        
        // Crear el objeto estante y agregarlo al array
        nuevosEstantes.push({
          id: `${Date.now()}-${i}`,                   // ID único usando timestamp
          establecimientoId: establecimiento.id,       // ID del almacén
          establecimientoNombre: establecimiento.nombre, // Nombre del almacén para mostrar
          seccion: seccion,                            // Letra de la sección
          nivel: i,                                    // Número de nivel
          codigo: codigo,                              // Código completo (A-01)
        });
      }

      // Agregar todos los nuevos estantes a la lista existente
      setEstantes([...estantes, ...nuevosEstantes]);
      
      // Limpiar el formulario después de guardar
      setFormData({
        establecimientoId: '',
        seccion: '',
        niveles: '',
      });
      
      // Ocultar el formulario y volver a la lista
      setShowForm(false);
      
      // Limpiar los mensajes de error
      setErrors({
        establecimientoId: '',
        seccion: '',
        niveles: '',
      });
      
      // Mostrar confirmación de éxito al usuario
      Alert.alert(
        '✅ ¡Lugares Creados!',
        `Se han creado ${cantidadNiveles} lugares de guardado en la sección ${seccion}.`,
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
      establecimientoId: '',
      seccion: '',
      niveles: '',
    });
    
    // Limpiar los mensajes de error
    setErrors({
      establecimientoId: '',
      seccion: '',
      niveles: '',
    });
  };

  // Función que agrupa los estantes por establecimiento para mostrarlos organizados
  // Usa reduce para transformar el array de estantes en un objeto agrupado por establecimientoId
  const estantesPorEstablecimiento = estantes.reduce((acc, estante) => {
    // Si este establecimiento no existe en el acumulador, crearlo
    if (!acc[estante.establecimientoId]) {
      acc[estante.establecimientoId] = {
        establecimiento: establecimientos.find((e) => e.id === estante.establecimientoId),
        estantes: [],
      };
    }
    // Agregar este estante al grupo de su establecimiento
    acc[estante.establecimientoId].estantes.push(estante);
    return acc;
  }, {} as Record<string, { establecimiento?: Establecimiento; estantes: Estante[] }>);

  // Renderizado del componente
  return (
    <Box className="flex-1 bg-[#000000]">
      <ScrollView className="flex-1">
        <Box className="p-6">
          {/* Título principal de la pantalla */}
          <Heading className="font-bold text-4xl mb-8 text-[#B8860B]">
            Lugares de Guardado
          </Heading>

          {/* Renderizado condicional con 3 casos: sin almacenes, lista de estantes, o formulario */}
          {/* Caso 1: Si no hay almacenes, mostrar mensaje de advertencia */}
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
            // Caso 2: Mostrar lista de estantes y botón para crear nuevos
            <>
              {/* Botón para mostrar el formulario de crear lugares */}
              <Box className="mb-8">
                <Button
                  size="xl"
                  action="primary"
                  onPress={() => setShowForm(true)}
                  className="bg-[#FFD700] py-2 rounded-2xl"
                >
                  <ButtonText className="text-2xl font-bold text-black">
                    ➕ Crear Lugares de Guardado
                  </ButtonText>
                </Button>
              </Box>

              {/* Lista de Estantes agrupados por Establecimiento */}
              {/* Si no hay estantes, mostrar mensaje de vacío */}
              {estantes.length === 0 ? (
                <Box className="mt-8 items-center bg-[#1a1a1a] p-10 rounded-2xl border-3 border-[#FFD700]">
                  <Text className="text-3xl mb-4">📍</Text>
                  <Text className="text-2xl text-[#FFD700] text-center font-semibold mb-3">
                    Aún no tiene lugares de guardado registrados
                  </Text>
                  <Text className="text-xl text-[#FFD700] text-center">
                    Toque el botón de arriba para crear lugares donde guardar sus productos
                  </Text>
                </Box>
              ) : (
                // Si hay estantes, mostrarlos agrupados por almacén y sección
                <VStack space="xl">
                  {/* Mapear cada grupo de establecimiento */}
                  {Object.values(estantesPorEstablecimiento).map((grupo) => (
                    <Box key={grupo.establecimiento?.id} className="mb-8">
                      {/* Encabezado del almacén */}
                      <Box className="bg-[#2a2a2a] p-5 rounded-t-2xl border-3 border-[#FFD700]">
                        <Text className="text-3xl font-bold text-[#FFD700]">
                          🏢 {grupo.establecimiento?.nombre}
                        </Text>
                      </Box>

                      {/* Agrupar estantes por sección (A, B, C, etc.) usando reduce */}
                      {Object.entries(
                        grupo.estantes.reduce((acc, estante) => {
                          // Si esta sección no existe en el acumulador, crearla
                          if (!acc[estante.seccion]) {
                            acc[estante.seccion] = [];
                          }
                          // Agregar el estante a su sección
                          acc[estante.seccion].push(estante);
                          return acc;
                        }, {} as Record<string, Estante[]>)
                      ).map(([seccion, estantesSeccion]) => (
                        // Mostrar cada sección con sus estantes
                        <Box
                          key={seccion}
                          className="bg-[#1a1a1a] border-3 border-[#FFD700] border-t-0 rounded-b-2xl p-6"
                        >
                          <Text className="text-2xl font-bold text-[#FFD700] mb-4">
                            📍 Sección {seccion}
                          </Text>
                          {/* Mostrar todos los estantes de esta sección en una cuadrícula */}
                          <Box className="flex-row flex-wrap gap-3">
                            {/* Ordenar estantes por nivel y mapearlos a cajas visuales */}
                            {estantesSeccion
                              .sort((a, b) => a.nivel - b.nivel)  // Ordenar de menor a mayor
                              .map((estante) => (
                                <Box
                                  key={estante.id}
                                  className="bg-[#2a2a2a] border-3 border-[#FFD700] px-5 py-4 rounded-xl min-w-[100px] items-center"
                                >
                                  <Text className="text-2xl font-bold text-[#FFD700]">
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
            // Caso 3: Mostrar formulario para crear nuevos lugares de guardado
            <Box className="bg-[#1a1a1a] p-8 rounded-2xl border-3 border-[#FFD700] shadow-lg">
              <Heading className="font-bold text-4xl mb-4 text-[#FFD700]">
                Crear Lugares de Guardado
              </Heading>
              <Text className="text-xl text-[#FFD700] mb-8 font-semibold">
                Complete los campos para crear lugares de guardado automáticamente. Se crearán todos los niveles de la sección que indique.
              </Text>

              <VStack space="xl">
                {/* ====== Paso 1: Seleccionar Almacén ====== */}
                {/* Encabezado del paso 1 */}
                <Box className="bg-[#2a2a2a] p-4 rounded-xl border-2 border-[#FFD700] mb-4">
                  <Text className="text-2xl font-bold text-[#FFD700] mb-1">
                    Paso 1: Seleccionar Almacén
                  </Text>
                  <Text className="text-lg text-[#FFD700]">
                    Elija en qué almacén quiere crear los lugares de guardado
                  </Text>
                </Box>

                {/* Campo: Selector de Establecimiento (dropdown) */}
                <FormControl isInvalid={!!errors.establecimientoId}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿En qué almacén quiere crear los lugares? *
                    </Text>
                  </FormControlLabel>
                  {/* Componente Select para mostrar un menú desplegable */}
                  <Select
                    selectedValue={formData.establecimientoId}
                    onValueChange={(value) => {
                      // Actualizar el valor seleccionado
                      setFormData({ ...formData, establecimientoId: value });
                      // Si había un error, limpiarlo
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
                          : 'border-[#FFD700]'
                      } bg-[#2a2a2a]`}
                    >
                      <SelectInput
                        placeholder="Elija un almacén de la lista"
                        className="text-2xl py-4 text-[#FFD700]"
                        placeholderTextColor="#B8860B"
                      />
                      <SelectIcon className="mr-3">
                        <ChevronDownIcon />
                      </SelectIcon>
                    </SelectTrigger>
                    {/* Portal que muestra el menú sobre todo lo demás */}
                    <SelectPortal>
                      <SelectBackdrop />  {/* Fondo oscuro detrás del menú */}
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />  {/* Indicador visual para cerrar */}
                        </SelectDragIndicatorWrapper>
                        <SelectScrollView>
                          {/* Mapear cada almacén a una opción del menú */}
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

                {/* ====== Paso 2: Configurar Sección y Niveles ====== */}
                {/* Encabezado del paso 2 */}
                <Box className="bg-[#2a2a2a] p-4 rounded-xl border-2 border-[#FFD700] mb-4">
                  <Text className="text-2xl font-bold text-[#FFD700] mb-1">
                    Paso 2: Configurar Sección y Cantidad
                  </Text>
                  <Text className="text-lg text-[#FFD700]">
                    Indique la letra de la sección y cuántos lugares quiere crear
                  </Text>
                </Box>

                {/* Campo: Letra de la Sección (solo acepta una letra) */}
                <FormControl isInvalid={!!errors.seccion}>
                  <FormControlLabel>
                    <Text className="text-2xl font-bold text-[#FFD700] mb-3">
                      ¿Qué letra quiere usar para la sección? *
                    </Text>
                  </FormControlLabel>
                  <Input
                    variant="outline"
                    size="xl"
                    className={`rounded-2xl border-3 ${
                      errors.seccion ? 'border-red-600' : 'border-[#FFD700]'
                    } bg-[#2a2a2a]`}
                  >
                    <InputField
                      placeholder="Ejemplo: A, B, C"
                      value={formData.seccion}
                      onChangeText={(text) => {
                        // Convertir a mayúscula y eliminar cualquier carácter que no sea letra
                        const upperText = text.toUpperCase().replace(/[^A-Z]/g, '');
                        setFormData({ ...formData, seccion: upperText });
                        // Si había un error, limpiarlo cuando el usuario empiece a escribir
                        if (errors.seccion) {
                          setErrors({ ...errors, seccion: '' });
                        }
                      }}
                      maxLength={1}                      // Permitir solo 1 carácter
                      className="text-2xl py-4 text-center text-[#FFD700]"
                      placeholderTextColor="#B8860B"
                      autoCapitalize="characters"        // Auto-capitalizar en móvil
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

                {/* Campo: Cantidad de Niveles a crear (número entre 1 y 99) */}
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
                      errors.niveles ? 'border-red-600' : 'border-[#FFD700]'
                    } bg-[#2a2a2a]`}
                  >
                    <InputField
                      placeholder="Ejemplo: 5"
                      value={formData.niveles}
                      onChangeText={(text) => {
                        // Eliminar cualquier carácter que no sea número
                        setFormData({
                          ...formData,
                          niveles: text.replace(/\D/g, ''),
                        });
                        // Si había un error, limpiarlo
                        if (errors.niveles) {
                          setErrors({ ...errors, niveles: '' });
                        }
                      }}
                      keyboardType="numeric"  // Mostrar teclado numérico en móvil
                      maxLength={2}            // Limitar a 2 dígitos (máximo 99)
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
                  {/* Mostrar mensaje de confirmación si los campos son válidos */}
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

                {/* Vista previa: Mostrar visualmente todos los lugares que se crearán */}
                {/* Solo se muestra si todos los campos son válidos */}
                {formData.seccion &&
                  formData.niveles &&
                  !errors.seccion &&
                  !errors.niveles && (
                    <Box className="bg-green-50 border-3 border-green-500 p-6 rounded-2xl">
                      <Text className="text-2xl font-bold text-green-900 mb-4">
                        ✅ Vista Previa - Se crearán los siguientes lugares:
                      </Text>
                      {/* Cuadrícula que muestra cada lugar que se creará */}
                      <Box className="flex-row flex-wrap gap-3">
                        {/* Crear un array de números del 1 al número de niveles */}
                        {Array.from(
                          { length: parseInt(formData.niveles) },
                          (_, i) => i + 1  // Generar [1, 2, 3, ..., n]
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

                {/* ====== Botones de acción ====== */}
                <VStack space="lg" className="mt-8">
                  {/* Botón para crear los lugares (valida y guarda) */}
                  <Button
                    size="xl"
                    action="primary"
                    onPress={handleSubmit}
                    className="bg-[#FFD700] py-2 rounded-2xl"
                  >
                    <ButtonText className="text-2xl font-bold text-black">
                      ✅ Crear Lugares de Guardado
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
