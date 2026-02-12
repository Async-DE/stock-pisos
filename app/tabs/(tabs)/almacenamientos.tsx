// Importaciones de React y hooks necesarios
import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { Dimensions } from "react-native";
import { useRouter } from "expo-router";

// Importación de componentes nativos de React Native
import { Alert, Image } from "react-native";
import {
  ClipboardCheck,
  Layers,
  MapPin,
  ShoppingCart,
  Warehouse,
} from "lucide-react-native";

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
  const router = useRouter();
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([
    {
      id: "1",
      nombre: "Almacén Central",
      calle: "Av. Principal 123",
      cp: "12345",
      colonia: "Centro",
      celular: "5551234567",
    },
  ]);

  // Estado que controla si se muestra el formulario de agregar nuevo establecimiento
  const [showForm, setShowForm] = useState(false);

  // Estado que almacena los datos del formulario mientras el usuario los completa
  const [formData, setFormData] = useState({
    nombre: "",
    calle: "",
    cp: "",
    colonia: "",
    celular: "",
  });

  // Estado que almacena los mensajes de error de validación para cada campo
  const [errors, setErrors] = useState({
    nombre: "",
    calle: "",
    cp: "",
    colonia: "",
    celular: "",
  });

  // Función que valida todos los campos del formulario antes de guardar
  const validateForm = () => {
    // Objeto temporal para almacenar los errores de validación
    const newErrors = {
      nombre: "",
      calle: "",
      cp: "",
      colonia: "",
      celular: "",
    };

    // Validar que el nombre no esté vacío
    if (!formData.nombre.trim()) {
      newErrors.nombre = "Por favor, escriba el nombre del almacén";
    }

    // Validar que la calle no esté vacía
    if (!formData.calle.trim()) {
      newErrors.calle = "Por favor, escriba la calle y número";
    }

    // Validar código postal: no vacío y exactamente 5 dígitos
    if (!formData.cp.trim()) {
      newErrors.cp = "Por favor, ingrese el código postal";
    } else if (!/^\d{5}$/.test(formData.cp)) {
      newErrors.cp = "El código postal debe tener exactamente 5 dígitos";
    }

    // Validar que la colonia no esté vacía
    if (!formData.colonia.trim()) {
      newErrors.colonia = "Por favor, escriba la colonia";
    }

    // Validar número de celular: no vacío y exactamente 10 dígitos
    if (!formData.celular.trim()) {
      newErrors.celular = "Por favor, ingrese el número de teléfono";
    } else if (!/^\d{10}$/.test(formData.celular.replace(/\D/g, ""))) {
      newErrors.celular = "El número de teléfono debe tener 10 dígitos";
    }

    // Actualizar el estado de errores
    setErrors(newErrors);
    // Retornar true si no hay errores, false si hay al menos un error
    return !Object.values(newErrors).some((error) => error !== "");
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
        celular: formData.celular.replace(/\D/g, ""), // Eliminar cualquier carácter que no sea dígito
      };

      // Agregar el nuevo establecimiento a la lista existente
      setEstablecimientos([...establecimientos, newEstablecimiento]);

      // Limpiar el formulario después de guardar
      setFormData({
        nombre: "",
        calle: "",
        cp: "",
        colonia: "",
        celular: "",
      });

      // Ocultar el formulario y volver a la lista
      setShowForm(false);

      // Limpiar los mensajes de error
      setErrors({
        nombre: "",
        calle: "",
        cp: "",
        colonia: "",
        celular: "",
      });

      // Mostrar confirmación de éxito al usuario
      Alert.alert(
        "✅ ¡Almacén Creado!",
        "El almacén se ha guardado correctamente.",
        [{ text: "Entendido", style: "default" }],
      );
    }
  };

  // Función que se ejecuta al presionar el botón "Cancelar"
  const handleCancel = () => {
    // Ocultar el formulario
    setShowForm(false);

    // Limpiar todos los datos ingresados en el formulario
    setFormData({
      nombre: "",
      calle: "",
      cp: "",
      colonia: "",
      celular: "",
    });

    // Limpiar los mensajes de error
    setErrors({
      nombre: "",
      calle: "",
      cp: "",
      colonia: "",
      celular: "",
    });
  };

  // Renderizado del componente
  return (
    <>
      {/* Header con logo */}
      <Center className="mt-12 mb-4 rounded-lg mx-4">
        <Box className="rounded-full">
          <Image
            source={require("@/assets/images/Pisos-logo2.jpeg")}
            style={{
              width: screenWidth < 375 ? 300 : 350,
              height: screenWidth < 375 ? 90 : 105,
              borderRadius: 10,
            }}
          />
        </Box>
      </Center>

      <Box className="flex-1 bg-[#000000] mt-40">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Box className="px-6 pb-8">
            {/* Acciones principales */}
            <Box className="mb-6">
              <VStack space="2xl">
                <Button
                  size="xl"
                  variant="outline"
                  action="secondary"
                  className="border-2 border-[#FFD700] bg-[#121212] rounded-3xl"
                  onPress={() => router.push("/tabs/(tabs)/estantes/nuevo")}
                >
                  <Layers size={24} color="#FFD700" strokeWidth={2} />
                  <ButtonText className="text-[30px] font-bold text-[#FFD700] text-left w-full">
                    Estantes
                  </ButtonText>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  action="secondary"
                  className="border-2 border-[#FFD700] bg-[#121212] rounded-3xl"
                  onPress={() => {}}
                >
                  <ShoppingCart size={24} color="#FFD700" strokeWidth={2} />
                  <ButtonText className="text-[30px] font-bold text-[#FFD700] text-left w-full">
                    Ventas
                  </ButtonText>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  action="secondary"
                  className="border-2 border-[#FFD700] bg-[#121212] rounded-3xl"
                  onPress={() => {}}
                >
                  <ClipboardCheck size={24} color="#FFD700" strokeWidth={2} />
                  <ButtonText className="text-[30px] font-bold text-[#FFD700] text-left w-full">
                    Auditorias
                  </ButtonText>
                </Button>
              </VStack>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </>
  );
}
