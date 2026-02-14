import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  itemSize: number;
  iconBoxSize: number;
  screenWidth: number;
  onPress: () => void;
}

export function CategoryCard({
  icon: IconComponent,
  name,
  itemSize,
  iconBoxSize,
  screenWidth,
  onPress,
}: CategoryCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Box className="items-center" style={{ width: itemSize }}>
        <Box
          className="bg-secondary-500 rounded-lg justify-center items-center border-2 border-[#169500]"
          style={{
            width: iconBoxSize,
            height: iconBoxSize,
            minHeight: 65,
            minWidth: 65,
          }}
        >
          <IconComponent
            size={iconBoxSize * 0.45}
            color="#fff112"
            strokeWidth={2}
          />
        </Box>
        <Text
          className="text-white text-center mt-1.5 font-medium text-sm leading-tight"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{
            fontSize: screenWidth < 375 ? 12 : 14,
            minHeight: 36,
            paddingHorizontal: 2,
          }}
        >
          {name}
        </Text>
      </Box>
    </Pressable>
  );
}
