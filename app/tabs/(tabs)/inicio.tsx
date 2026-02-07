import { useState } from 'react';
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Dimensions } from 'react-native';
import { 
  Search, 
  ShoppingBag, 
  Smartphone, 
  Shirt, 
  Apple, 
  Wrench, 
  Sofa, 
  Gamepad2, 
  BookOpen, 
  Dumbbell,
  Home
} from "lucide-react-native";

import { Input, InputField } from "@/components/ui/input";

// Obtener dimensiones de la pantalla
const { width: screenWidth } = Dimensions.get('window');

// Datos de ejemplo para las categorías con iconos específicos
const categories = [
  { id: 1, name: 'Productos', icon: ShoppingBag },
  { id: 2, name: 'Tecnología', icon: Smartphone },
  { id: 3, name: 'Moda', icon: Shirt },
  { id: 4, name: 'Supermercado', icon: Apple },
  { id: 5, name: 'Ferretería', icon: Wrench },
  { id: 6, name: 'Hogar', icon: Sofa },
  { id: 7, name: 'Entretenimiento', icon: Gamepad2 },
  { id: 8, name: 'Educación', icon: BookOpen },
  { id: 9, name: 'Deportes', icon: Dumbbell },
];

export default function Inicio() {
  const [searchTerm, setSearchTerm] = useState('');

  // Calcular tamaño de los items basado en el ancho de la pantalla
  const itemSize = Math.min((screenWidth - 40) / 3, 100); // Más compacto: 100px máximo
  const iconBoxSize = itemSize * 0.7; // Reducido a 70%

  // Filtrar categorías basado en la búsqueda
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para renderizar las categorías en grid
  const renderCategoriesGrid = (categoriesList: typeof categories) => {
    const rows = [];
    
    for (let i = 0; i < categoriesList.length; i += 3) {
      const rowCategories = categoriesList.slice(i, i + 3);
      rows.push(
        <HStack 
          key={`row-${i}`} 
          space="sm" // Reducido a 'sm' para más compacto
          reversed={false} 
          className="mt-3 justify-between"
        >
          {rowCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Box 
                key={category.id} 
                className="items-center"
                style={{ width: itemSize }}
              >
                <Box 
                  className="bg-secondary-500 rounded-lg justify-center items-center border-2 border-yellow-400"
                  style={{ 
                    width: iconBoxSize, 
                    height: iconBoxSize,
                    minHeight: 65,
                    minWidth: 65
                  }}
                >
                  <IconComponent 
                    size={iconBoxSize * 0.45} // Reducido a 45%
                    color="#fff112" 
                    strokeWidth={2}
                  />
                </Box>
                <Text 
                  className="text-white text-center mt-1.5 font-medium text-sm leading-tight"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{ 
                    fontSize: screenWidth < 375 ? 12 : 14, // Texto más pequeño en pantallas angostas
                    minHeight: 36, // Altura mínima para evitar que se corte
                    paddingHorizontal: 2 // Pequeño padding horizontal
                  }}
                >
                  {category.name}
                </Text>
              </Box>
            );
          })}
        </HStack>
      );
    }
    
    return rows;
  };

  return (
    <ScrollView 
      className="flex-1 bg-[#000000]"
      contentContainerStyle={{ 
        flexGrow: 1, 
        paddingBottom: 16,
        paddingTop: 8
      }}
      showsVerticalScrollIndicator={false}
    >
      <Box className="flex-1 px-3">
        {/* Logo de la compañía - Más compacto */}
        <Center className="mt-2 mb-4">
          <Box className="flex-row items-center justify-center">
            <Box className="bg-yellow-400 rounded-full p-2 mr-2">
              <Home size={26} color="#000000" strokeWidth={2.5} />
            </Box>
            <Text 
              className="text-white text-2xl font-bold"
              style={{ fontSize: screenWidth < 375 ? 22 : 28 }}
            >
              MercaFácil
            </Text>
          </Box>
        </Center>

        {/* Barra de búsqueda - Más compacta */}
        <Box className="mb-5">
          <HStack
            space="sm"
            reversed={false}
            className="items-center bg-secondary-400 py-2.5 px-3 rounded-lg border-2 border-yellow-400"
          >
            <Search size={22} color="#FFFFFF" strokeWidth={2} />
            <Input
              variant="outline"
              size="sm" // Cambiado a 'sm' para más compacto
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
              className="flex-1 border-0"
            >
              <InputField 
                placeholder="Buscar..." 
                value={searchTerm}
                onChangeText={setSearchTerm}
                className="text-white text-sm placeholder:text-gray-300"
                placeholderTextColor="#9CA3AF"
              />
            </Input>
          </HStack>
        </Box>

        {/* Grid de categorías */}
        {filteredCategories.length === 0 ? (
          <Center className="py-8">
            <Box className="items-center">
              <Search size={42} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-400 text-center text-base mt-3 font-medium">
                No encontramos esa categoría
              </Text>
              <Text className="text-gray-500 text-center text-xs mt-1">
                Intenta con otro nombre
              </Text>
            </Box>
          </Center>
        ) : (
          <Box className="pb-6">
            {renderCategoriesGrid(filteredCategories)}
          </Box>
        )}
      </Box>
    </ScrollView>
  );
}