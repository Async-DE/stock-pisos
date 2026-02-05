// Importaciones necesarias para la navegación por pestañas
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';  // Librería de iconos FontAwesome
import { Tabs } from 'expo-router';  // Componente de navegación por pestañas de Expo Router
import { useClientOnlyValue } from '@/components/useClientOnlyValue';  // Hook para valores solo en cliente

/**
 * Componente TabBarIcon
 * 
 * Componente auxiliar que renderiza un icono de FontAwesome
 * para usarse en la barra de pestañas inferior.
 * 
 * @param props.name - Nombre del icono de FontAwesome a mostrar
 * @param props.color - Color del icono (cambia según si está activa o no la pestaña)
 * @returns Componente FontAwesome configurado para la barra de pestañas
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  // Renderiza el icono con tamaño 18 y un margen negativo para alineación
  return <FontAwesome size={18} style={{ marginBottom: -3 }} {...props} />;
}

/**
 * Componente TabLayout
 * 
 * Layout principal que define la navegación por pestañas (tabs) de la aplicación.
 * Configura todas las pantallas accesibles desde la barra de navegación inferior:
 * - Inicio: Pantalla principal
 * - Productos: Gestión de productos del inventario
 * - Establecimientos: Gestión de almacenes/tiendas
 * - Estantes: Gestión de lugares de guardado
 * - Usuarios: Gestión de usuarios del sistema
 * - Bitácora: Registro de actividades
 * 
 * Cada pestaña tiene su propio icono y título personalizado.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Deshabilitar el renderizado estático del header en web
        // Esto previene un error de hidratación en React Navigation v6
        // useClientOnlyValue retorna false en servidor (SSR) y true en cliente
        headerShown: useClientOnlyValue(false, true),
        // Configuración de colores para la barra de pestañas
        tabBarActiveTintColor: '#FFD700',  // Color dorado para iconos y texto activos
        tabBarInactiveTintColor: '#B8860B',  // Color dorado oscuro para iconos y texto inactivos
        tabBarStyle: {
          backgroundColor: '#000000',  // Fondo negro para la barra de pestañas
          borderTopColor: '#FFD700',  // Borde superior dorado
        },
        tabBarLabelStyle: {
          fontSize: 12,  // Tamaño del texto de las etiquetas
          fontWeight: '600',  // Peso de la fuente
        },
      }}
    >
      {/* Pestaña: Inicio - Pantalla principal de la aplicación */}
      <Tabs.Screen
        name="inicio"  // Nombre del archivo de la ruta (inicio.tsx)
        options={{
          title: 'Inicio',  // Título que aparece en la pestaña
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,  // Icono de casa
        }}
      />
      
      {/* Pestaña: Productos - Gestión del inventario de productos */}
      <Tabs.Screen
        name="productos"  // Nombre del archivo de la ruta (productos.tsx)
        options={{
          title: 'Productos',  // Título que aparece en la pestaña
          tabBarIcon: ({ color }) => <TabBarIcon name="cube" color={color} />,  // Icono de cubo
        }}
      />
      
      {/* Pestaña: Establecimientos - Gestión de almacenes/tiendas */}
      <Tabs.Screen
        name="establecimientos"  // Nombre del archivo de la ruta (establecimientos.tsx)
        options={{
          title: 'Establecimientos',  // Título que aparece en la pestaña
          tabBarIcon: ({ color }) => <TabBarIcon name="building" color={color} />,  // Icono de edificio
        }}
      />
      
      {/* Pestaña: Estantes - Gestión de lugares de guardado */}
      <Tabs.Screen
        name="estantes"  // Nombre del archivo de la ruta (estantes.tsx)
        options={{
          title: 'Estantes',  // Título que aparece en la pestaña
          tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} />,  // Icono de archivo
        }}
      />
      
      {/* Pestaña: Usuarios - Gestión de usuarios del sistema */}
      <Tabs.Screen
        name="usuarios"  // Nombre del archivo de la ruta (usuarios.tsx)
        options={{
          title: 'Usuarios',  // Título que aparece en la pestaña
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,  // Icono de usuarios
        }}
      />
      
      {/* Pestaña: Bitácora - Registro de actividades y eventos */}
      <Tabs.Screen
        name="bitacora"  // Nombre del archivo de la ruta (bitacora.tsx)
        options={{
          title: 'Bitacora',  // Título que aparece en la pestaña
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,  // Icono de libro
        }}
      />
    </Tabs>
  );
}
