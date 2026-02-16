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
        tabBarActiveTintColor: "#13E000",
        tabBarInactiveTintColor: "#169500",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#13E000",
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
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />

      <Tabs.Screen
        name="almacenamientos"
        options={{
          title: "Opciones",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="ellipsis-h" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="producto/[id]"
        options={{
          href: null,
          headerShown: false,
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

      <Tabs.Screen
        name="ventas/buscar"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="auditorias"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
