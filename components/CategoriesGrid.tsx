import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Search } from "lucide-react-native";
import { CategoryCard } from "./CategoryCard";
import type { LucideIcon } from "lucide-react-native";
import { Dimensions } from "react-native";

interface CategoriesGridProps {
  categories: Array<{
    id: number;
    name: string;
    icon: LucideIcon;
  }>;
  onCategoryPress: (categoryId: number) => void;
  screenWidth?: number;
  itemSize?: number;
  iconBoxSize?: number;
}

const defaultScreenWidth = Dimensions.get("window").width;

export function CategoriesGrid({
  categories,
  onCategoryPress,
  screenWidth = defaultScreenWidth,
  itemSize = Math.min((defaultScreenWidth - 40) / 3, 100),
  iconBoxSize = itemSize * 0.7,
}: CategoriesGridProps) {
  if (categories.length === 0) {
    return (
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
    );
  }

  const rows = [];
  for (let i = 0; i < categories.length; i += 3) {
    const rowCategories = categories.slice(i, i + 3);
    rows.push(
      <HStack
        key={`row-${i}`}
        space="sm"
        reversed={false}
        className="mt-3 justify-between"
      >
        {rowCategories.map((category) => (
          <CategoryCard
            key={category.id}
            icon={category.icon}
            name={category.name}
            itemSize={itemSize}
            iconBoxSize={iconBoxSize}
            screenWidth={screenWidth}
            onPress={() => onCategoryPress(category.id)}
          />
        ))}
      </HStack>,
    );
  }

  return <Box className="pb-6">{rows}</Box>;
}
