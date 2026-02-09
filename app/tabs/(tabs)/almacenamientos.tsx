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
          <Heading className="font-bold text-3xl mb-6 text-[#B8860B]">
            Mis Almacenes
          </Heading>

          <Box className="mb-6">
            <VStack space="md">
              <Button
                size="xl"
                variant="outline"
                action="secondary"
                className="border-3 border-[#FFD700] bg-[#1a1a1a] rounded-2xl"
                onPress={() => {}}
              >
                <ButtonText className="text-xl font-bold text-[#FFD700] text-left w-full">
                  Ubicaciones
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
        </Box>
      </ScrollView>
    </Box>
  );
}

