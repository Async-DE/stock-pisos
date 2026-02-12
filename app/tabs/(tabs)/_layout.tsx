import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={18} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, false),
        tabBarActiveTintColor: "#FFD700",
        tabBarInactiveTintColor: "#B8860B",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#FFD700",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="buscar"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color }) => <TabBarIcon name="cube" color={color} />,
        }}
      />

      <Tabs.Screen
        name="almacenamientos"
        options={{
          title: "Almacenamientos",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="building" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="producto/[id]"
        options={{
          href: null, // Oculta esta ruta del tab bar (no aparece como tab, pero el tab bar sigue visible)
          headerShown: false, // No mostrar header superior
          // El tab bar se mostrará automáticamente porque está dentro de Tabs
        }}
      />

      <Tabs.Screen
        name="producto/nuevo"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="producto/[id]/variante/nuevo"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="estantes/nuevo"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="ventas/nuevo"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
