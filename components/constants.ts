import {
  ShoppingBag,
  Smartphone,
  Shirt,
  Apple,
  Wrench,
  Sofa,
  Gamepad2,
  BookOpen,
  Dumbbell,
  Heart,
  Sparkles,
  Car,
  PawPrint,
  Book,
  Music,
  Plane,
  Leaf,
  Headphones,
  Zap,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

// Array de iconos para usar como fallback cuando no hay categorías del API
export const categoryIcons: LucideIcon[] = [
  ShoppingBag,
  Smartphone,
  Shirt,
  Apple,
  Wrench,
  Sofa,
  Gamepad2,
  BookOpen,
  Dumbbell,
  Heart,
  Sparkles,
  Car,
  PawPrint,
  Book,
  Music,
  Plane,
  Leaf,
  Headphones,
  Zap,
];

export type ProductVariant = {
  id: number;
  name: string;
  price: number;
  stock?: number;
  attributes?: Record<string, string>; // ej: { color: "Rojo", size: "M" }
};

export type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  variants?: ProductVariant[];
  productId?: number; // ID real del producto del API (para consultar detalles)
};

