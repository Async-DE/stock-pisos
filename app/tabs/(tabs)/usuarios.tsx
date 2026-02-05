// Importación de componentes UI para el diseño de la pantalla
import { Center } from '@/components/ui/center';  // Componente para centrar contenido
import { Divider } from '@/components/ui/divider';  // Línea divisoria
import { Heading } from '@/components/ui/heading';  // Componente para títulos
import { Text } from '@/components/ui/text';  // Componente para texto
import { Box } from '@/components/ui/box';  // Contenedor básico

/**
 * Componente Usuarios
 * 
 * Pantalla placeholder para la gestión de usuarios del sistema.
 * Actualmente muestra un mensaje de texto indicando que es el área
 * de gestión de usuarios. Esta pantalla puede ser extendida en el
 * futuro para incluir funcionalidades como:
 * - Lista de usuarios registrados
 * - Creación de nuevos usuarios
 * - Edición de perfiles de usuario
 * - Asignación de roles y permisos
 * - Gestión de accesos al sistema
 */
export default function Usuarios() {
  return (
    // Contenedor principal que centra todo el contenido vertical y horizontalmente
    <Center className="flex-1 bg-[#000000]">
      {/* Caja que agrupa los elementos y los alinea al centro */}
      <Box className="items-center">
        {/* Título principal de la pantalla */}
        <Heading className="font-bold text-2xl text-[#FFD700]">Usuarios</Heading>
        
        {/* Línea divisoria decorativa con margen vertical y 80% de ancho */}
        <Divider className="my-[30px] w-[80%] bg-[#FFD700]" />
        
        {/* Texto descriptivo explicando el propósito de esta sección */}
        <Text className="p-4 text-center text-[#FFD700]">
          Gestión de usuarios del sistema
        </Text>
      </Box>
    </Center>
  );
}

