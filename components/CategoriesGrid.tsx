import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Pressable, Image } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, ChevronDown } from "lucide-react-native";

// Mapeo de IDs de categoría a imágenes específicas
const categoryImageMap: { [key: number]: any } = {
  1: require("../assets/images/RED.jpeg"),
  2: require("../assets/images/Green.jpeg"),
  3: require("../assets/images/wine.jpeg"),
  4: require("../assets/images/Orange.jpeg"),
  5: require("../assets/images/Gray.jpeg"),
};

interface CategoriesGridProps {
  categories: Array<{
    id: number;
    name: string;
    icon?: any; // Ahora opcional ya que usamos el ID para determinar la imagen
    subcategories: Array<{
      id: number;
      name: string;
      gananciaVentas?: number;
      valorStock?: number;
    }>;
  }>;
  onSubcategoryPress: (
    categoryId: number,
    subcategoryId: number,
    subcategoryName: string,
  ) => void;
}

export function CategoriesGrid({
  categories,
  onSubcategoryPress,
}: CategoriesGridProps) {
  const formatPrice = (price?: number) => {
    return `$ ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price ?? 0)}`;
  };

  if (categories.length === 0) {
    return (
      <Center className="py-8">
        <Box className="items-center">
          <Search size={42} color="#9CA3AF" strokeWidth={1.5} />
          <Text className="text-gray-400 text-center text-base mt-3 font-medium">
            No encontramos esa categoria o subcategoria
          </Text>
          <Text className="text-gray-500 text-center text-xs mt-1">
            Intenta con otro nombre
          </Text>
        </Box>
      </Center>
    );
  }

  return (
    <Box className="pb-6">
      <Accordion type="multiple" variant="unfilled" className="gap-3">
        {categories.map((category) => {
          // Usar imagen específica según el ID de categoría
          const imageSource = categoryImageMap[category.id];

          return (
            <AccordionItem
              key={category.id}
              value={`category-${category.id}`}
              className="border border-[#169500] rounded-xl bg-secondary-500/50 overflow-hidden"
            >
              <AccordionHeader>
                <AccordionTrigger className="px-3 py-3">
                  <HStack
                    space="sm"
                    reversed={false}
                    className="items-center flex-1"
                  >
                    <Box className="items-center justify-center w-11 h-11 rounded-lg overflow-hidden">
                      {imageSource ? (
                        <Image
                          source={imageSource}
                          style={{ width: 44, height: 44 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Search size={40} color="#fff112" strokeWidth={2} />
                      )}
                    </Box>
                    <AccordionTitleText className="text-white flex-1 text-2xl font-semibold">
                      {category.name}
                    </AccordionTitleText>
                  </HStack>
                  <AccordionIcon as={ChevronDown} className="text-[#169500]" />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="pt-0">
                <Box className="px-3 py-2">
                  {category.subcategories.length === 0 ? (
                    <Text className="text-gray-400 text-sm">
                      Sin subcategorias
                    </Text>
                  ) : (
                    category.subcategories.map((subcategory, index) => (
                      <Pressable
                        key={`${category.id}-${subcategory.id}-${index}`}
                        onPress={() =>
                          onSubcategoryPress(
                            category.id,
                            subcategory.id,
                            subcategory.name,
                          )
                        }
                      >
                        <Box className="bg-secondary-500/50 rounded-md px-3 py-3 mt-2 border-2 border-[#169500]">
                          <Text className="text-white text-xl font-medium">
                            {subcategory.name}
                          </Text>
                          <HStack space="md" className="mt-2 justify-between">
                            <Box>
                              <Text className="text-gray-400 text-xs">
                                Ganancias
                              </Text>
                              <Text className="text-[#13E000] text-sm font-semibold">
                                {formatPrice(subcategory.gananciaVentas)}
                              </Text>
                            </Box>
                            <Box>
                              <Text className="text-gray-400 text-xs">
                                Valor Stock
                              </Text>
                              <Text className="text-[#13E000] text-sm font-semibold">
                                {formatPrice(subcategory.valorStock)}
                              </Text>
                            </Box>
                          </HStack>
                        </Box>
                      </Pressable>
                    ))
                  )}
                </Box>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
}
