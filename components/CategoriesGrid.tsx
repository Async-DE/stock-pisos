import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Pressable } from "react-native";
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
import type { LucideIcon } from "lucide-react-native";

interface CategoriesGridProps {
  categories: Array<{
    id: number;
    name: string;
    icon: LucideIcon;
    subcategories: string[];
  }>;
  onSubcategoryPress: (categoryId: number, subcategory: string) => void;
}

export function CategoriesGrid({
  categories,
  onSubcategoryPress,
}: CategoriesGridProps) {
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
          const IconComponent = category.icon;
          return (
            <AccordionItem
              key={category.id}
              value={`category-${category.id}`}
              className="border-2 border-yellow-400 rounded-lg bg-secondary-500/40"
            >
              <AccordionHeader>
                <AccordionTrigger className="px-3 py-3">
                  <HStack
                    space="sm"
                    reversed={false}
                    className="items-center flex-1"
                  >
                    <Box className="bg-secondary-500 rounded-md border-2 border-yellow-400 items-center justify-center w-11 h-11">
                      <IconComponent
                        size={20}
                        color="#fff112"
                        strokeWidth={2}
                      />
                    </Box>
                    <AccordionTitleText className="text-white flex-1">
                      {category.name}
                    </AccordionTitleText>
                  </HStack>
                  <AccordionIcon as={ChevronDown} className="text-yellow-400" />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="pt-0">
                <Box className="bg-secondary-400/40 rounded-md px-3 py-2">
                  {category.subcategories.length === 0 ? (
                    <Text className="text-gray-400 text-sm">
                      Sin subcategorias
                    </Text>
                  ) : (
                    category.subcategories.map((subcategory) => (
                      <Pressable
                        key={`${category.id}-${subcategory}`}
                        onPress={() =>
                          onSubcategoryPress(category.id, subcategory)
                        }
                      >
                        <Text className="text-white text-sm py-1">
                          {subcategory}
                        </Text>
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
