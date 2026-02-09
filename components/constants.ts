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

export const categories = [
  { id: 1, name: "Productos", icon: ShoppingBag },
  { id: 2, name: "Tecnología", icon: Smartphone },
  { id: 3, name: "Moda", icon: Shirt },
  { id: 4, name: "Supermercado", icon: Apple },
  { id: 5, name: "Ferretería", icon: Wrench },
  { id: 6, name: "Hogar", icon: Sofa },
  { id: 7, name: "Entretenimiento", icon: Gamepad2 },
  { id: 8, name: "Educación", icon: BookOpen },
  { id: 9, name: "Deportes", icon: Dumbbell },
  { id: 10, name: "Salud y Bienestar", icon: Heart },
  { id: 11, name: "Belleza", icon: Sparkles },
  { id: 12, name: "Automóviles", icon: Car },
  { id: 13, name: "Mascotas", icon: PawPrint },
  { id: 14, name: "Libros", icon: Book },
  { id: 15, name: "Música", icon: Music },
  { id: 16, name: "Viajes", icon: Plane },
  { id: 17, name: "Jardín", icon: Leaf },
  { id: 18, name: "Accesorios", icon: Headphones },
  { id: 19, name: "Utilidades", icon: Zap },
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
};

export const productsByCategory: Record<number, Product[]> = {
  1: [
    {
      id: 1,
      name: "Producto Premium 1",
      price: 1500,
    },
    {
      id: 2,
      name: "Producto Premium 2",
      price: 1200,
    },
    {
      id: 3,
      name: "Producto Premium 3",
      price: 2500,
    },
    {
      id: 4,
      name: "Producto Premium 4",
      price: 890,
    },
    {
      id: 5,
      name: "Producto Premium 5",
      price: 3200,
    },
    {
      id: 6,
      name: "Producto Premium 6",
      price: 1650,
    },
  ],
  2: [
    {
      id: 7,
      name: "Laptop i5",
      price: 45000,
    },
    { id: 8, name: "Mouse Inalámbrico", price: 850 },
    {
      id: 9,
      name: "Teclado Mecánico",
      price: 3200,
    },
    { id: 10, name: "Monitor 27 4K", price: 8500 },
    {
      id: 11,
      name: "Auriculares Bluetooth",
      price: 2500,
    },
    { id: 12, name: "Webcam HD", price: 1200 },
  ],
  3: [
    {
      id: 13,
      name: "Camiseta Premium",
      price: 350,
      description: "Camiseta de alta calidad con diseño moderno",
      variants: [
        { id: 1, name: "Rojo - Talla S", price: 350, stock: 10, attributes: { color: "Rojo", size: "S" } },
        { id: 2, name: "Rojo - Talla M", price: 350, stock: 15, attributes: { color: "Rojo", size: "M" } },
        { id: 3, name: "Rojo - Talla L", price: 350, stock: 8, attributes: { color: "Rojo", size: "L" } },
        { id: 4, name: "Azul - Talla S", price: 350, stock: 12, attributes: { color: "Azul", size: "S" } },
        { id: 5, name: "Azul - Talla M", price: 350, stock: 20, attributes: { color: "Azul", size: "M" } },
        { id: 6, name: "Azul - Talla L", price: 350, stock: 5, attributes: { color: "Azul", size: "L" } },
      ],
    },
    {
      id: 14,
      name: "Pantalón Casual",
      price: 650,
      description: "Pantalón cómodo y versátil para uso diario",
      variants: [
        { id: 7, name: "Negro - Talla 30", price: 650, stock: 7, attributes: { color: "Negro", size: "30" } },
        { id: 8, name: "Negro - Talla 32", price: 650, stock: 10, attributes: { color: "Negro", size: "32" } },
        { id: 9, name: "Gris - Talla 30", price: 650, stock: 5, attributes: { color: "Gris", size: "30" } },
        { id: 10, name: "Gris - Talla 32", price: 650, stock: 8, attributes: { color: "Gris", size: "32" } },
      ],
    },
    {
      id: 15,
      name: "Chaqueta de Invierno",
      price: 2800,
      description: "Chaqueta abrigada perfecta para el invierno",
      variants: [
        { id: 11, name: "Negro - Talla M", price: 2800, stock: 6, attributes: { color: "Negro", size: "M" } },
        { id: 12, name: "Negro - Talla L", price: 2800, stock: 4, attributes: { color: "Negro", size: "L" } },
        { id: 13, name: "Azul Marino - Talla M", price: 2800, stock: 8, attributes: { color: "Azul Marino", size: "M" } },
        { id: 14, name: "Azul Marino - Talla L", price: 2800, stock: 3, attributes: { color: "Azul Marino", size: "L" } },
      ],
    },
    {
      id: 16,
      name: "Zapatillas Deportivas",
      price: 1500,
      description: "Zapatillas cómodas para entrenamiento y uso diario",
      variants: [
        { id: 15, name: "Blanco - Talla 40", price: 1500, stock: 12, attributes: { color: "Blanco", size: "40" } },
        { id: 16, name: "Blanco - Talla 42", price: 1500, stock: 15, attributes: { color: "Blanco", size: "42" } },
        { id: 17, name: "Negro - Talla 40", price: 1500, stock: 10, attributes: { color: "Negro", size: "40" } },
        { id: 18, name: "Negro - Talla 42", price: 1500, stock: 8, attributes: { color: "Negro", size: "42" } },
      ],
    },
    {
      id: 17,
      name: "Accesorios de Moda",
      price: 450,
    },
    { id: 18, name: "Gorro Térmico", price: 280 },
  ],
  4: [
    {
      id: 19,
      name: "Leche Integral 1L",
      price: 120,
    },
    { id: 20, name: "Pan Integral", price: 280 },
    { id: 21, name: "Almendras 500g", price: 650 },
    { id: 22, name: "Aceite de Oliva", price: 890 },
    { id: 23, name: "Huevos Doena", price: 450 },
    {
      id: 24,
      name: "Café Gourmet 250g",
      price: 520,
    },
  ],
  5: [
    {
      id: 25,
      name: "Taladro Percutor",
      price: 3500,
    },
    { id: 26, name: "Martillo de Goma", price: 450, },
    {
      id: 27,
      name: "Juego de Destornilladores",
      price: 650,
    },
    {
      id: 28,
      name: "Sierra Circular",
      price: 5200,
    },
    { id: 29, name: "Cinta Métrica 5m", price: 280 },
    { id: 30, name: "Nivel Láser", price: 2800 },
  ],
  6: [
    {
      id: 31,
      name: "Sofá 3 Cuerpos",
      price: 12500,
    },
    { id: 32, name: "Mesa de Centro", price: 2200 },
    { id: 33, name: "Lámpara de Pie", price: 1500 },
    {
      id: 34,
      name: "Cortinas Premium",
      price: 3500,
    },
    { id: 35, name: "Almohadas Set 2", price: 890 },
    { id: 36, name: "Tapete 2x3m", price: 2800 },
  ],
};

export const getProductsForCategory = (categoryId: number): Product[] => {
  return productsByCategory[categoryId] || [];
};

export const getProductById = (productId: number): Product | null => {
  for (const categoryProducts of Object.values(productsByCategory)) {
    const product = categoryProducts.find((p) => p.id === productId);
    if (product) {
      return product;
    }
  }
  return null;
};
